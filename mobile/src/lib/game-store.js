// 1:1 port of src/lib/game-store.tsx — same shape, AsyncStorage instead of localStorage
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SEASON_XP_PER_TIER = 500;

const defaultState = {
  level: 7,
  xp: 220,
  xpToNext: 500,
  coins: 1240,
  gems: 28,
  streak: 14,
  seasonTier: 12,
  seasonXp: 180,
  spinAvailableAt: 0,
  quests: [
    { id: "q1", title: "Win 3 duels", desc: "Crush opponents in any subject", goal: 3, progress: 1, xp: 120, coins: 80, type: "daily", icon: "⚔️" },
    { id: "q2", title: "Study 20 minutes", desc: "Any subject counts", goal: 20, progress: 8, xp: 80, coins: 40, type: "daily", icon: "📚" },
    { id: "q3", title: "Perfect a topic", desc: "Hit 100% in any topic quiz", goal: 1, progress: 0, xp: 200, coins: 120, type: "daily", icon: "🎯" },
    { id: "q4", title: "Reach Top 10 in school", desc: "Climb the school leaderboard", goal: 1, progress: 0, xp: 500, coins: 300, type: "weekly", icon: "🏆" },
    { id: "q5", title: "Collect 3 mastery cards", desc: "Unlock cards from the vault", goal: 3, progress: 1, xp: 700, coins: 500, type: "weekly", icon: "💎" },
  ],
  powerups: [
    { id: "freeze", name: "Time Freeze", desc: "Pause the duel clock 10s", emoji: "❄️", price: 200, currency: "coins", owned: 2 },
    { id: "fifty", name: "50/50", desc: "Eliminate two wrong answers", emoji: "🎯", price: 150, currency: "coins", owned: 3 },
    { id: "double", name: "2× XP Boost", desc: "Double XP for next duel", emoji: "⚡", price: 5, currency: "gems", owned: 1 },
    { id: "shield", name: "Streak Shield", desc: "Protect your streak 1 day", emoji: "🛡️", price: 10, currency: "gems", owned: 0 },
    { id: "hint", name: "Nova Hint", desc: "Get an AI nudge mid-duel", emoji: "💡", price: 100, currency: "coins", owned: 5 },
    { id: "skip", name: "Skip Question", desc: "Skip without losing combo", emoji: "⏭️", price: 80, currency: "coins", owned: 4 },
  ],
  lastLevelUp: null,
  lastReward: null,
  // Mobile addition — student profile from registration
  profile: { 
    name: "", avatarClass: "", gradeLevel: "", pathway: "", subjects: [], commitment: "", onboarded: false,
    settings: { sound: true, haptics: true, language: "English" }
  },
};

function xpToNextFor(level) { return 300 + level * 75; }

const GameContext = createContext(null);
const KEY = "brainduel.game.v1";

export function GameProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try { setState((s) => ({ ...s, ...JSON.parse(raw) })); } catch {}
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const api = useMemo(() => ({
    ...state,
    hydrated,
    addXp(n) {
      setState((s) => {
        let xp = s.xp + n;
        let level = s.level;
        let xpToNext = s.xpToNext;
        let leveled = false;
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = xpToNextFor(level);
          leveled = true;
        }
        return {
          ...s, xp, level, xpToNext,
          seasonXp: (s.seasonXp + n) % SEASON_XP_PER_TIER,
          seasonTier: s.seasonTier + Math.floor((s.seasonXp + n) / SEASON_XP_PER_TIER),
          lastLevelUp: leveled ? Date.now() : s.lastLevelUp,
          lastReward: { kind: "xp", amount: n, ts: Date.now() },
        };
      });
    },
    addCoins(n) { setState((s) => ({ ...s, coins: s.coins + n, lastReward: { kind: "coins", amount: n, ts: Date.now() } })); },
    addGems(n) { setState((s) => ({ ...s, gems: s.gems + n, lastReward: { kind: "gems", amount: n, ts: Date.now() } })); },
    progressQuest(id, by = 1) {
      setState((s) => ({ ...s, quests: s.quests.map((q) => q.id === id ? { ...q, progress: Math.min(q.goal, q.progress + by) } : q) }));
    },
    claimQuest(id) {
      const q = ref.current.quests.find((q) => q.id === id);
      if (!q || q.progress < q.goal) return;
      setState((s) => ({ ...s, quests: s.quests.filter((x) => x.id !== id) }));
      api.addXp(q.xp);
      api.addCoins(q.coins);
    },
    buyPowerUp(id) {
      const p = ref.current.powerups.find((p) => p.id === id);
      if (!p) return false;
      const balance = p.currency === "coins" ? ref.current.coins : ref.current.gems;
      if (balance < p.price) return false;
      setState((s) => ({
        ...s,
        coins: p.currency === "coins" ? s.coins - p.price : s.coins,
        gems: p.currency === "gems" ? s.gems - p.price : s.gems,
        powerups: s.powerups.map((x) => x.id === id ? { ...x, owned: x.owned + 1 } : x),
      }));
      return true;
    },
    usePowerUp(id) {
      const p = ref.current.powerups.find((p) => p.id === id);
      if (!p || p.owned <= 0) return false;
      setState((s) => ({ ...s, powerups: s.powerups.map((x) => x.id === id ? { ...x, owned: x.owned - 1 } : x) }));
      return true;
    },
    claimSpin(reward) {
      setState((s) => ({ ...s, spinAvailableAt: Date.now() + 1000 * 60 * 60 * 20 }));
      if (reward.kind === "xp") api.addXp(reward.amount);
      if (reward.kind === "coins") api.addCoins(reward.amount);
      if (reward.kind === "gems") api.addGems(reward.amount);
    },
    setSeasonTier(t) { setState((s) => ({ ...s, seasonTier: t })); },
    resetLevelUp() { setState((s) => ({ ...s, lastLevelUp: null })); },
    setProfile(p) { setState((s) => ({ ...s, profile: { ...s.profile, ...p } })); },
    recordMatch(match) {
      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          matches: [match, ...(s.profile.matches || [])]
        }
      }));
    },
  }), [state, hydrated]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame() {
  const c = useContext(GameContext);
  if (!c) throw new Error("useGame must be inside GameProvider");
  return c;
}
