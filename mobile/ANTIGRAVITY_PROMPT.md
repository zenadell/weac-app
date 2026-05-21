# Paste this verbatim into Google Antigravity

---

You are working on a React Native (Expo SDK 51) mobile app called **BrainDuel**. The project is at `/Users/mac/Desktop/waec-prep/mobile`. Your scope is **design, UI, animation, and 3D polish only**. Another agent (Claude) owns the data layer — never touch:

- `src/services/api.js`
- `src/lib/game-store.js`
- `src/lib/subjects.js`
- `src/lib/utils.js`
- `src/lib/confetti.js`
- `babel.config.js` (hand-tuned for Reanimated 3.10 — modifying will break the build)

**Step 1:** Read `DESIGN_BRIEF.md` in full. It contains every screen, component, animation, color token, and quality standard. It is the source of truth.

**Step 2:** Read `ASSETS_TO_DOWNLOAD.md`. Download every Lottie / Rive / 3D model listed there into the matching `assets/` subfolder. The brief assumes these exist.

**Step 3:** Audit the current implementation. Every screen in `src/screens/` is a 1:1 port from the original Lovable web design (TanStack Router + framer-motion + Tailwind). Honor the layout — your job is to **add motion, 3D, polish, sound, and dark mode** without altering hierarchy, gradient choices, or component shapes.

**Step 4:** Implement the deliverables in the checklist (§15 of `DESIGN_BRIEF.md`). For each screen, ensure:
- Every Pressable has a tap-scale animation + haptic
- At least 3 staggered MotiView entrances
- At least 1 looping ambient animation
- Skeleton loaders (no spinners)
- An empty state with Lottie
- Dark mode support (test toggling in Settings)
- 60fps on mid-tier Android

**Step 5:** Build the new components listed in §8.2 of the brief. Especially:
- `<Confetti>` (Skia particle burst)
- `<NumberRoll>` (animated counter for XP/coins)
- `<Card3D>` (react-three-fiber for Vault mastery cards with holographic foil)
- `<SpinWheel>` (Rive-based wheel for daily spin)
- `<Avatar3D>` (Rive avatar for Nova in Tutor)
- `<MotiPressable>` (replaces every Pressable in the codebase)
- `<Toast>` (slide-up notifications)

**Step 6:** Add features missing from the current implementation:
- Onboarding (3 slides before Register) — see §7.1
- Papers screen (past papers browser) — see §7.19
- Dark mode toggle in Settings (full theme support)
- Sound effects layer (`src/lib/sounds.js`) wired to expo-av
- Haptics layer (`src/lib/haptics.js`) wired to expo-haptics
- Share-as-image for RoastCard and Profile (use `react-native-view-shot`)

**Step 7:** Run `npx expo start --lan` and visually QA every screen on a real Android device using Expo Go. Fix any layout breakages, animation jank, or contrast issues.

**Tech stack is LOCKED.** Do not change versions in `package.json`. Do not run `npx expo install --fix`. If you need a new dependency, add it without disturbing existing ones, and verify the babel config still loads (run `node -e "require('./babel.config.js')()" — must not throw).

**Quality bar:** This app should feel like a $50M-funded startup product. Apple-tier polish. Duolingo-tier delight. Every screen should be rich, animated, and slightly overwhelming on first view, then quickly intuitive.

**When done:** Run `npx eas build --platform android --profile preview --no-wait` to ship a preview APK. Confirm the build succeeds before declaring complete.

**Do not redesign.** The user already endured one bad rewrite. Layout, gradients, padding, and component shapes from the existing Lovable port are correct. Add motion and 3D — don't subtract.

Begin by reading `DESIGN_BRIEF.md`.
