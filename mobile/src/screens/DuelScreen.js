// 1:1 port of src/routes/duel.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView, MotiImage, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Share2 } from "lucide-react-native";
import AppShell from "../components/AppShell";
import PageTransition from "../components/PageTransition";
import RoastCard from "../components/RoastCard";
import Gradient from "../components/Gradient";
import { celebrate } from "../lib/confetti";
import { useGame } from "../lib/game-store";
import { API } from "../services/api";
import swords from "../../assets/lovable/swords.png";
import { MotiPressable } from "../components/primitives/MotiPressable";
import { NumberRoll } from "../components/motion/NumberRoll";
import { play } from "../lib/sounds";
import LottieView from "lottie-react-native";

// Fallback if Supabase is unreachable. Same shape the screen uses.
const FALLBACK_QUESTIONS = [
  {
    text: "A composite fruit is formed from",
    options: ["A single flower with one carpel", "An inflorescence", "A single flower with many carpels", "A fleshy receptacle"],
    correct: 1,
    subject: "Biology",
  },
  {
    text: "Which of the following is not a function of the liver?",
    options: ["Deamination of proteins", "Production of bile", "Secretion of insulin", "Storage of iron"],
    correct: 2,
    subject: "Biology",
  },
  {
    text: "In mammals, the organ directly on top of the kidney is the",
    options: ["Adrenal gland", "Prostate gland", "Pancreas", "Thyroid gland"],
    correct: 0,
    subject: "Biology",
  },
];

// Convert Supabase row → DuelScreen's expected shape.
// Supabase has options as object {A,B,C,D,E?} and answer as letter "A".
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

  // Pull real exam questions from Supabase for the user's preferred subject
  useEffect(() => {
    const subject = profile?.subjects?.[0] || "Biology";
    API.getQuestions(subject, undefined, 12)
      .then((rows) => {
        if (rows?.length) {
          const normalized = rows
            .map(normalize)
            .filter((q) => q.text && q.options.length >= 2)
            .sort(() => Math.random() - 0.5);
          if (normalized.length) setQuestions(normalized);
        }
      })
      .catch(() => {/* keep fallback */});
  }, [profile?.subjects?.[0]]);

  useEffect(() => {
    if (phase === "matching") {
      play("match-found");
      const t = setTimeout(() => setPhase("playing"), 2800);
      return () => clearTimeout(t);
    }
    if (phase === "playing") {
      const t = setInterval(() => {
        setTime((s) => {
          if (s <= 1) {
            clearInterval(t);
            setPhase("result");
            return 0;
          }
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
        recordMatch({
          opp: "Chad_12X",
          subject: profile?.subjects?.[0] || "Biology",
          my: myScore,
          oppScore: oppScore,
          won,
          ts: Date.now()
        });
      }
    }
  }, [phase]);

  const handleSelect = (i) => {
    if (selected !== null) return;
    const currentQ = questions[qIndex % questions.length];
    setSelected(i);
    
    if (i === currentQ.correct) {
      play("correct");
      setMyScore((s) => s + 2);
    } else {
      play("wrong");
    }

    setTimeout(() => {
      setSelected(null);
      setQIndex((q) => q + 1);
    }, 1200);
  };

  const currentQ = questions[qIndex % questions.length];

  return (
    <AppShell hideNav>
      <PageTransition>
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
          <MotiPressable
            onPress={() => navigation.navigate("Home")}
            className="size-11 items-center justify-center rounded-2xl bg-white border border-black/5"
            style={shadowSoft}
          >
            <ArrowLeft size={20} color="#1B1A2E" strokeWidth={2.4} />
          </MotiPressable>
          <Text className="text-sm font-semibold text-muted-foreground">
            {phase === "playing" ? `Round ${qIndex + 1}` : phase === "result" ? "Match complete" : "Finding opponent"}
          </Text>
          <MotiPressable className="size-11 items-center justify-center rounded-2xl bg-white border border-black/5" style={shadowSoft}>
            <Share2 size={20} color="#1B1A2E" strokeWidth={2.4} />
          </MotiPressable>
        </View>

        <AnimatePresence exitBeforeEnter>
          {phase === "matching" && <Matchmaking key="m" />}
          {phase === "playing" && (
            <Playing
              key="p"
              time={time}
              question={currentQ}
              selected={selected}
              onSelect={handleSelect}
              myScore={myScore}
              oppScore={oppScore}
            />
          )}
          {phase === "result" && <Result key="r" myScore={myScore} oppScore={oppScore} onShare={() => navigation.navigate("Home")} />}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}

function Matchmaking() {
  return (
    <MotiView
      from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 items-center justify-center px-6"
    >
      <View className="relative size-64 items-center justify-center mt-8">
        {[0, 1, 2, 3].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ loop: true, type: "timing", duration: 3000, delay: i * 750 }}
            className="absolute inset-0 rounded-full border border-lilac"
          />
        ))}
        
        {/* Floating Avatar 1 */}
        <MotiView
          from={{ translateY: -10 }} animate={{ translateY: 10 }}
          transition={{ loop: true, type: "timing", duration: 2500, direction: "alternate" }}
          className="absolute -top-4 -left-4 size-14 rounded-full bg-peach border-4 border-white shadow-lg"
        />

        {/* Floating Avatar 2 */}
        <MotiView
          from={{ translateY: 10 }} animate={{ translateY: -10 }}
          transition={{ loop: true, type: "timing", duration: 2800, direction: "alternate" }}
          className="absolute bottom-4 -right-4 size-16 rounded-full bg-sky border-4 border-white shadow-lg"
        />
        
        {/* Central Core */}
        <MotiView
          from={{ rotate: "0deg", scale: 0.95 }} animate={{ rotate: "360deg", scale: 1.05 }}
          transition={{ loop: true, type: "timing", duration: 15000, direction: "alternate" }}
        >
          <Gradient name="lilac" className="size-[140px] items-center justify-center rounded-full shadow-2xl border-4 border-white">
            <MotiImage
              source={swords}
              from={{ rotate: "0deg" }} animate={{ rotate: "-360deg" }}
              transition={{ loop: true, type: "timing", duration: 15000 }}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </Gradient>
        </MotiView>
      </View>

      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }} className="mt-16 items-center">
        <Text className="text-[2rem] font-black tracking-tight leading-tight text-ink">Searching arena</Text>
        <Text className="mt-3 text-center text-sm font-medium text-muted-foreground px-8">
          Locating a Biology master at your skill level to challenge you.
        </Text>
      </MotiView>
      
      <View className="mt-8 flex-row items-center gap-2">
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.2, scale: 0.8 }} animate={{ opacity: 1, scale: 1.2 }}
            transition={{ loop: true, type: "timing", duration: 1000, delay: i * 200, direction: "alternate" }}
            className="size-2.5 rounded-full bg-lilac"
          />
        ))}
      </View>
    </MotiView>
  );
}

function Playing({ time, question, selected, onSelect, myScore, oppScore }) {
  return (
    <MotiView from={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-6">
      {/* VS scoreboard */}
      <View className="mb-8 flex-row items-center gap-3 rounded-[32px] bg-white p-5 border border-black/5" style={shadowSoft}>
        <Side name="You" score={myScore} gradient="peach" />
        <View className="items-center px-4">
          <Text className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Time</Text>
          <Text className={`text-[2rem] font-black tabular-nums ${time < 10 ? "text-coral" : "text-ink"}`}>
            {String(time).padStart(2, "0")}
          </Text>
        </View>
        <Side name="Chad_12X" score={oppScore} gradient="lilac" align="right" />
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <View className="rounded-full bg-mint/30 px-3 py-1.5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider text-teal">Biology · Round {myScore/2 + oppScore/2 + 1}</Text>
        </View>
      </View>

      <View style={{ minHeight: 120 }}>
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={question.text}
            from={{ opacity: 0, translateX: 15 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -15 }}
            transition={{ type: "timing", duration: 250 }}
          >
            <Text className="text-[1.75rem] font-bold tracking-tight leading-tight text-ink mb-8" style={{ fontSize: 28 }}>
              {question.text}
            </Text>

            <View style={{ gap: 14 }}>
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = selected !== null && i === question.correct;
                const isWrong = isSelected && i !== question.correct;
                
                return (
                  <MotiPressable
                    key={i}
                    onPress={() => onSelect(i)}
                    className={`flex-row items-center gap-4 rounded-[24px] border-2 p-5 ${
                      isCorrect ? "border-teal bg-mint/20" :
                      isWrong ? "border-coral bg-coral/10" :
                      isSelected ? "border-ink bg-white" :
                      "border-transparent bg-white"
                    }`}
                    style={!isCorrect && !isWrong && !isSelected ? shadowSoft : undefined}
                  >
                    <MotiView 
                      animate={{ scale: isWrong ? 0.85 : 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className={`size-12 items-center justify-center rounded-[18px] ${
                        isCorrect ? "bg-teal" : isWrong ? "bg-coral" : "bg-canvas"
                      }`}
                    >
                      <Text className={`text-base font-black ${isCorrect || isWrong ? "text-white" : "text-ink"}`}>
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </MotiView>
                    <Text className="flex-1 text-[1.05rem] font-semibold text-ink leading-snug">{opt}</Text>
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

function Side({ name, score, gradient, align = "left" }) {
  return (
    <View className={`flex-1 flex-row items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <Gradient name={gradient} className="size-[52px] rounded-[20px] border border-black/5" />
      <View>
        <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider" style={align === "right" ? { textAlign: "right" } : undefined}>{name}</Text>
        <NumberRoll value={score} className="text-[1.35rem] font-black tabular-nums tracking-tight text-ink" style={align === "right" ? { textAlign: "right" } : undefined} />
      </View>
    </View>
  );
}

function Result({ myScore, oppScore, onShare }) {
  const won = myScore >= oppScore;
  useEffect(() => { 
    if (won) {
      celebrate();
      play("levelup");
    }
  }, [won]);
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="px-6 pt-4 pb-8"
    >
      <View className="mb-5 items-center">
        <Text className="text-3xl font-semibold text-ink">{won ? "Victory!" : "So close."}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {won ? "+24 XP · Streak extended" : "Try again — your streak is safe"}
        </Text>
      </View>

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

      <MotiPressable
        onPress={onShare}
        className="mt-4 h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-white border border-black/5"
        style={shadowSoft}
      >
        <Share2 size={16} color="#1B1A2E" />
        <Text className="text-sm font-semibold text-ink">Back home</Text>
      </MotiPressable>
    </MotiView>
  );
}

const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
