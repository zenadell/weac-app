import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Share2, Zap, ShieldAlert, Award, Flame, CheckCircle, XCircle } from "lucide-react-native";
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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, interpolate, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const MAX_HP = 40;

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

// Pulsing Timer Component
function PulsingTimer({ time }) {
  const pulse = useSharedValue(0);
  const isDanger = time <= 10;

  useEffect(() => {
    if (isDanger) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })),
        -1, true
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [isDanger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isDanger ? interpolate(pulse.value, [0, 1], [1, 1.15]) : 1 }],
  }));

  return (
    <Animated.View style={[animatedStyle, styles.timerContainer]}>
      <LinearGradient
        colors={isDanger ? ['#FA675E', '#E5463D'] : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)']}
        style={styles.timerGradient}
      >
        <Text style={[styles.timerLabel, isDanger && { color: 'rgba(255,255,255,0.8)' }]}>TIME</Text>
        <Text style={[styles.timerValue, isDanger && { color: '#FFF' }]}>
          {String(time).padStart(2, "0")}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

// HP Bar Component
function HPBar({ score, label, color, align }) {
  const pct = Math.min(100, (score / MAX_HP) * 100);
  return (
    <View style={[styles.hpContainer, align === 'right' && { alignItems: 'flex-end' }]}>
      <View style={styles.hpLabelRow}>
        <Text style={styles.hpLabel}>{label}</Text>
        <Text style={[styles.hpScore, { color }]}>{score}</Text>
      </View>
      <View style={styles.hpBarBg}>
        <MotiView
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', damping: 20 }}
          style={[styles.hpBarFill, { backgroundColor: color }, align === 'right' && { alignSelf: 'flex-end' }]}
        />
      </View>
    </View>
  );
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
  const [combo, setCombo] = useState(0);
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
        if (Math.random() > 0.7) setOppScore((s) => Math.min(s + 2, MAX_HP));
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
      play("correct");
      setMyScore((s) => s + 2);
      setCombo((c) => c + 1);
    } else {
      play("wrong");
      setCombo(0);
    }
    setTimeout(() => {
      setSelected(null); setQIndex((q) => q + 1);
    }, 1000);
  };

  const currentQ = questions[qIndex % questions.length];

  return (
    <AppShell hideNav>
      <PageTransition>
        <View style={styles.screen}>
          {/* Top Nav */}
          <View style={styles.topNav}>
            <Pressable
              onPress={() => navigation.navigate("Home")}
              style={styles.navButton}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
            <View style={styles.phasePill}>
              <Text style={styles.phaseText}>
                {phase === "playing" ? `ROUND ${qIndex + 1}` : phase === "result" ? "MATCH COMPLETE" : "SEARCHING"}
              </Text>
            </View>
            <Pressable style={styles.navButton}>
              <Share2 size={20} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
          </View>

          <AnimatePresence exitBeforeEnter>
            {phase === "matching" && <Matchmaking key="m" />}
            {phase === "playing" && (
              <Playing key="p" time={time} question={currentQ} selected={selected} onSelect={handleSelect} myScore={myScore} oppScore={oppScore} combo={combo} />
            )}
            {phase === "result" && <Result key="r" myScore={myScore} oppScore={oppScore} combo={combo} onShare={() => navigation.navigate("Home")} />}
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

function Playing({ time, question, selected, onSelect, myScore, oppScore, combo }) {
  return (
    <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={styles.playingContainer}>
      
      {/* Scoreboard with HP Bars */}
      <View style={styles.scoreboard}>
        {/* Player Side */}
        <View style={styles.playerSide}>
          <View style={[styles.avatarSquircle, { backgroundColor: '#FA675E' }]}>  
            <Text style={styles.avatarLetter}>Y</Text>
          </View>
          <HPBar score={myScore} label="YOU" color="#30C5A0" align="left" />
        </View>

        {/* Timer */}
        <PulsingTimer time={time} />

        {/* Opponent Side */}
        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.avatarSquircle, { backgroundColor: '#9575CD' }]}>
            <Text style={styles.avatarLetter}>C</Text>
          </View>
          <HPBar score={oppScore} label="CHAD" color="#FA675E" align="right" />
        </View>
      </View>

      {/* Combo Counter */}
      {combo >= 2 && (
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.comboBadge}
        >
          <Flame size={16} color="#FFB63B" fill="#FFB63B" />
          <Text style={styles.comboText}>{combo}x Streak</Text>
        </MotiView>
      )}

      {/* Question Area */}
      <View style={styles.questionArea}>
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={question.text}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text style={styles.questionText}>
              {question.text}
            </Text>

            <View style={{ gap: 14 }}>
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = selected !== null && i === question.correct;
                const isWrong = isSelected && i !== question.correct;
                
                const bgColor = isCorrect ? 'rgba(48, 197, 160, 0.15)' :
                                 isWrong ? 'rgba(250, 103, 94, 0.15)' :
                                 '#15151A';
                const borderColor = isCorrect ? '#30C5A0' :
                                     isWrong ? '#FA675E' :
                                     'rgba(255,255,255,0.06)';

                return (
                  <Pressable
                    key={i}
                    onPress={() => onSelect(i)}
                  >
                    <MotiView
                      animate={{ 
                        scale: isWrong ? 0.97 : isCorrect ? 1.02 : 1,
                      }}
                      transition={{ type: "spring", damping: 15 }}
                      style={[styles.optionCard, { backgroundColor: bgColor, borderColor }]}
                    >
                      <View style={[styles.optionIndex, { 
                        backgroundColor: isCorrect ? '#30C5A0' : isWrong ? '#FA675E' : 'rgba(255,255,255,0.06)' 
                      }]}>
                        {isCorrect ? (
                          <CheckCircle size={20} color="#000" strokeWidth={3} />
                        ) : isWrong ? (
                          <XCircle size={20} color="#000" strokeWidth={3} />
                        ) : (
                          <Text style={[styles.optionIndexText, isCorrect || isWrong ? { color: '#000' } : {}]}>
                            {String.fromCharCode(65 + i)}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.optionText, { 
                        color: isCorrect ? '#30C5A0' : isWrong ? '#FA675E' : '#FFFFFF'
                      }]}>
                        {opt}
                      </Text>
                    </MotiView>
                  </Pressable>
                );
              })}
            </View>
          </MotiView>
        </AnimatePresence>
      </View>
    </MotiView>
  );
}

function Result({ myScore, oppScore, combo, onShare }) {
  const won = myScore >= oppScore;
  useEffect(() => { if (won) { celebrate(); play("levelup"); } }, [won]);
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={styles.resultContainer}
    >
      {/* Big Result Icon */}
      <View style={styles.resultIconArea}>
        <MotiView
          from={{ scale: 0, rotate: '-45deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 12, delay: 200 }}
        >
          {won ? <Award size={80} color="#30C5A0" strokeWidth={1.5} /> : <ShieldAlert size={80} color="#FA675E" strokeWidth={1.5} />}
        </MotiView>
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
          <Text style={[styles.resultTitle, { color: won ? '#30C5A0' : '#FA675E' }]}>
            {won ? "VICTORY" : "DEFEAT"}
          </Text>
        </MotiView>
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 600 }}>
          <Text style={styles.resultSub}>
            {won ? `+24 XP · ${combo > 1 ? combo + 'x Combo · ' : ''}Arena Conquered` : "Try again to claim glory"}
          </Text>
        </MotiView>
      </View>

      {/* Score Comparison */}
      <MotiView from={{ opacity: 0, translateY: 30 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }} style={styles.scoreCompare}>
        <View style={styles.scoreColumn}>
          <Text style={styles.scorePlayerLabel}>YOU</Text>
          <Text style={[styles.scoreFinal, { color: '#30C5A0' }]}>{myScore}</Text>
        </View>
        <View style={styles.scoreDivider}>
          <Text style={styles.scoreVs}>VS</Text>
        </View>
        <View style={[styles.scoreColumn, { alignItems: 'flex-end' }]}>
          <Text style={styles.scorePlayerLabel}>CHAD</Text>
          <Text style={[styles.scoreFinal, { color: '#FA675E' }]}>{oppScore}</Text>
        </View>
      </MotiView>

      {/* Roast Card */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 700 }} style={{ width: '100%' }}>
        <RoastCard
          data={{
            winnerName: won ? "You" : "Chad_12X",
            loserName: won ? "Chad_12X" : "You",
            winnerScore: Math.max(myScore, oppScore),
            loserScore: Math.min(myScore, oppScore),
            subject: "Biology",
            xpGained: won ? 24 : 8,
            combo: combo > 1 ? combo : undefined,
          }}
          onShare={onShare}
        />
      </MotiView>

      {/* Return Button */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 900 }} style={{ width: '100%' }}>
        <Pressable onPress={onShare} style={styles.returnButton}>
          <Text style={styles.returnText}>Return to Base</Text>
        </Pressable>
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09090B' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  navButton: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#15151A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  phasePill: {
    backgroundColor: 'rgba(250, 103, 94, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(250, 103, 94, 0.25)',
  },
  phaseText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FA675E',
    letterSpacing: 2,
  },
  playingContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  
  // Scoreboard
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  playerSide: {
    flex: 1,
    gap: 8,
  },
  avatarSquircle: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  
  // HP Bars
  hpContainer: { gap: 4, flex: 1 },
  hpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  hpScore: {
    fontSize: 20,
    fontWeight: '900',
  },
  hpBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },

  // Timer
  timerContainer: {
    alignItems: 'center',
  },
  timerGradient: {
    width: 72, height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },

  // Combo
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 182, 59, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 59, 0.3)',
    marginBottom: 16,
  },
  comboText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFB63B',
    letterSpacing: 0.5,
  },

  // Question
  questionArea: { flex: 1 },
  questionText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
  },
  optionIndex: {
    width: 48, height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },

  // Result
  resultContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flex: 1,
    alignItems: 'center',
  },
  resultIconArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultTitle: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
    marginTop: 16,
  },
  resultSub: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 8,
    textAlign: 'center',
  },
  scoreCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#15151A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scoreColumn: { flex: 1 },
  scorePlayerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreFinal: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -2,
  },
  scoreDivider: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  scoreVs: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
  returnButton: {
    height: 64,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  returnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#09090B',
    letterSpacing: -0.5,
  },
});
