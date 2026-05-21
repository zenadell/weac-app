import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { MotiView, MotiImage, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Share2, Target, Zap, ShieldAlert, Award } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import RoastCard from "../components/RoastCard";
import { celebrate } from "../lib/confetti";
import { useGame } from "../lib/game-store";
import { API } from "../services/api";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { NumberRoll } from "../components/motion/NumberRoll";
import { play } from "../lib/sounds";
import { ExpandingAvatarRing } from "../components/ui/expanding-avatar-ring";

const { width } = Dimensions.get("window");

const FALLBACK_QUESTIONS = [
  { text: "A composite fruit is formed from", options: ["A single flower with one carpel", "An inflorescence", "A single flower with many carpels", "A fleshy receptacle"], correct: 1, subject: "Biology" },
  { text: "Which of the following is not a function of the liver?", options: ["Deamination of proteins", "Production of bile", "Secretion of insulin", "Storage of iron"], correct: 2, subject: "Biology" },
  { text: "In mammals, the organ directly on top of the kidney is the", options: ["Adrenal gland", "Prostate gland", "Pancreas", "Thyroid gland"], correct: 0, subject: "Biology" },
];

function normalize(row) {
  const opts = row.options || {};
  const letters = ["A", "B", "C", "D", "E"].filter((k) => opts[k]);
  const optionsArray = letters.map((k) => opts[k]);
  const correct = letters.indexOf(row.answer);
  return {
    text: row.question_text,
    options: optionsArray,
    correct: correct >= 0 ? correct : 0,
    subject: row.subject,
  };
}

export default function DuelScreen() {
  const navigation = useNavigation();
  const { addXp, addCoins, progressQuest, profile, recordMatch } = useGame();
  const [phase, setPhase] = useState("matching");
  const [time, setTime] = useState(60);
  const [selected, setSelected] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);

  useEffect(() => {
    const subject = profile?.subjects?.[0] || "Biology";
    API.getQuestions(subject, undefined, 12).then((rows) => {
      if (rows?.length) {
        const normalized = rows.map(normalize).filter((q) => q.text && q.options.length >= 2).sort(() => Math.random() - 0.5);
        if (normalized.length) setQuestions(normalized);
      }
    }).catch(() => {});
  }, [profile?.subjects?.[0]]);

  useEffect(() => {
    if (phase === "matching") {
      play("match-found");
      const t = setTimeout(() => setPhase("playing"), 3000);
      return () => clearTimeout(t);
    }
    if (phase === "playing") {
      const t = setInterval(() => {
        setTime((s) => {
          if (s <= 1) { clearInterval(t); setPhase("result"); return 0; }
          if (s <= 11) play("tick-clock");
          return s - 1;
        });
        if (Math.random() > 0.7) setOppScore((s) => Math.min(s + 2, 40));
      }, 1000);
      return () => clearInterval(t);
    }
    if (phase === "result") {
      const won = myScore >= oppScore;
      addXp(won ? 24 : 8);
      addCoins(won ? 40 : 10);
      if (won) progressQuest("q1", 1);
      if (recordMatch) {
        recordMatch({ opp: "Chad_12X", subject: profile?.subjects?.[0] || "Biology", my: myScore, oppScore, won, ts: Date.now() });
      }
    }
  }, [phase]);

  const handleSelect = (i) => {
    if (selected !== null) return;
    const currentQ = questions[qIndex % questions.length];
    setSelected(i);
    if (i === currentQ.correct) {
      play("correct"); setMyScore((s) => s + 2);
    } else {
      play("wrong");
    }
    setTimeout(() => {
      setSelected(null); setQIndex((q) => q + 1);
    }, 1000);
  };

  const currentQ = questions[qIndex % questions.length];

  return (
    <AppShell hideNav>
      <PageTransition>
        <View className="flex-1 bg-[#121214]">
          <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
            <MotiPressable
              onPress={() => navigation.navigate("Home")}
              className="size-12 items-center justify-center rounded-2xl bg-[#1C1C24] border border-white/5"
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </MotiPressable>
            <View className="bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30">
              <Text className="text-[11px] font-black uppercase tracking-widest text-primary">
                {phase === "playing" ? `Round ${qIndex + 1}` : phase === "result" ? "Match Complete" : "Searching"}
              </Text>
            </View>
            <MotiPressable className="size-12 items-center justify-center rounded-2xl bg-[#1C1C24] border border-white/5">
              <Share2 size={20} color="#FFFFFF" strokeWidth={2.4} />
            </MotiPressable>
          </View>

          <AnimatePresence exitBeforeEnter>
            {phase === "matching" && <Matchmaking key="m" />}
            {phase === "playing" && (
              <Playing key="p" time={time} question={currentQ} selected={selected} onSelect={handleSelect} myScore={myScore} oppScore={oppScore} />
            )}
            {phase === "result" && <Result key="r" myScore={myScore} oppScore={oppScore} onShare={() => navigation.navigate("Home")} />}
          </AnimatePresence>
        </View>
      </PageTransition>
    </AppShell>
  );
}

function Matchmaking() {
  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 items-center justify-center">
      <ExpandingAvatarRing 
        isActive={true} 
        centerTitle="Versus"
        centerSubtitle="Locating worthy opponent"
        accentColor="#FA675E"
      />
    </MotiView>
  );
}

function Playing({ time, question, selected, onSelect, myScore, oppScore }) {
  return (
    <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 pt-4">
      
      {/* Modern Bento Scoreboard */}
      <View className="flex-row items-center justify-between bg-[#1C1C24] p-4 rounded-[32px] border border-white/5 mb-10">
        <View className="flex-row items-center gap-3 w-1/3">
          <View className="size-12 rounded-[18px] bg-primary items-center justify-center">
            <Text className="text-xl font-black text-white">Y</Text>
          </View>
          <NumberRoll value={myScore} className="text-2xl font-black text-white tabular-nums" />
        </View>
        
        <View className="items-center justify-center flex-1">
          <Text className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Time</Text>
          <Text className={`text-3xl font-black tabular-nums leading-none ${time < 10 ? "text-primary" : "text-white"}`}>
            {String(time).padStart(2, "0")}
          </Text>
        </View>

        <View className="flex-row items-center gap-3 w-1/3 justify-end">
          <NumberRoll value={oppScore} className="text-2xl font-black text-white tabular-nums" />
          <View className="size-12 rounded-[18px] bg-purple items-center justify-center">
            <Text className="text-xl font-black text-white">C</Text>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={question.text}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text className="text-[2rem] font-black tracking-tight leading-tight text-white mb-10">
              {question.text}
            </Text>

            <View style={{ gap: 16 }}>
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = selected !== null && i === question.correct;
                const isWrong = isSelected && i !== question.correct;
                
                return (
                  <MotiPressable
                    key={i}
                    onPress={() => onSelect(i)}
                    className={`flex-row items-center gap-5 rounded-[28px] border-2 p-5 ${
                      isCorrect ? "border-green bg-green/10" :
                      isWrong ? "border-primary bg-primary/10" :
                      isSelected ? "border-white bg-[#1C1C24]" :
                      "border-white/5 bg-[#1C1C24]"
                    }`}
                  >
                    <MotiView 
                      animate={{ scale: isWrong ? 0.9 : 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className={`size-14 items-center justify-center rounded-[20px] ${
                        isCorrect ? "bg-green" : isWrong ? "bg-primary" : "bg-white/5"
                      }`}
                    >
                      <Text className={`text-xl font-black ${isCorrect || isWrong ? "text-[#121214]" : "text-white/60"}`}>
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </MotiView>
                    <Text className={`flex-1 text-[1.1rem] font-bold leading-snug ${isCorrect ? "text-green" : isWrong ? "text-primary" : "text-white"}`}>
                      {opt}
                    </Text>
                  </MotiPressable>
                );
              })}
            </View>
          </MotiView>
        </AnimatePresence>
      </View>
    </MotiView>
  );
}

function Result({ myScore, oppScore, onShare }) {
  const won = myScore >= oppScore;
  useEffect(() => { if (won) { celebrate(); play("levelup"); } }, [won]);
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="px-6 pt-10 pb-8 flex-1 items-center"
    >
      <View className="mb-10 items-center">
        {won ? <Award size={64} color="#30C5A0" strokeWidth={1.5} /> : <ShieldAlert size={64} color="#FA675E" strokeWidth={1.5} />}
        <Text className="text-[3.5rem] font-black tracking-tighter text-white mt-6 leading-none">
          {won ? "Victory" : "Defeat"}
        </Text>
        <Text className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {won ? "+24 XP · Arena Conquered" : "Try again to claim glory"}
        </Text>
      </View>

      <View className="w-full">
        <RoastCard
          data={{
            winnerName: won ? "You" : "Chad_12X",
            loserName: won ? "Chad_12X" : "You",
            winnerScore: Math.max(myScore, oppScore),
            loserScore: Math.min(myScore, oppScore),
            subject: "Biology",
            xpGained: won ? 24 : 8,
            combo: won ? 5 : undefined,
          }}
          onShare={onShare}
        />
      </View>

      <MotiPressable
        onPress={onShare}
        className="mt-10 h-16 w-full flex-row items-center justify-center gap-3 rounded-full bg-white shadow-xl"
      >
        <Text className="text-xl font-black text-[#121214]">Return to Base</Text>
      </MotiPressable>
    </MotiView>
  );
}
