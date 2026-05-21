# BrainDuel — Full Project Handoff

> **For Google Antigravity.** You already built the frontend. This document gives you everything to finish: data wiring, credentials, build commands, constraints, and a per-screen TODO list.
>
> The project lives at `/Users/mac/Desktop/waec-prep/mobile` and you have full write access. The previous agent (Claude) has reverted to the version that contains your design + a Supabase wire on DuelScreen. Nothing in your design has been touched.

---

## 1. What is BrainDuel?

A gamified exam-prep mobile app (React Native + Expo SDK 51) for students preparing for international exams (WAEC, JAMB, NECO, A-Levels, SAT, GCSE, BECE). Features:

- Quick 1v1 quiz duels (Duel screen)
- AI topic predictions from 15 years of WAEC data (Predict screen)
- Daily quests, season pass, daily spin, shop, tournaments, squads
- Mastery vault with collectible cards
- AI tutor "Nova" (Tutor screen)
- Personal profile + school leaderboards

The frontend is **fully designed by Antigravity** — every screen, component, animation, 3D element, and motion primitive is in place. The data layer needs to be finished.

---

## 2. Credentials & Accounts

### Supabase (live backend)

```
URL:        https://wbxyakpfjwtoxwqefjap.supabase.co
Anon key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHlha3Bmand0b3h3cWVmamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTc1MTAsImV4cCI6MjA5NDM3MzUxMH0.9PkScP4sj8hLi0w3uDzdp8Z63dLan7mpUfaDGyDm1vI
```

Already wired in `src/services/api.js`. Tables:
- `questions` — exam questions with options + answer
- `predictions` — ML-generated topic probabilities per subject/year

### Expo / EAS (cloud builds)

```
Account:        templeton_dc
Project ID:     57cc8d94-afa8-41d1-9cae-53d8bf742947
Project name:   @templeton_dc/waecprep
EXPO_TOKEN:     idiMR_zwbpilXnqAwJZRKcGJx9028Ylj6bw5lO9m
```

This token has full project access. Use it like:
```bash
EXPO_TOKEN=idiMR_zwbpilXnqAwJZRKcGJx9028Ylj6bw5lO9m ./node_modules/.bin/eas build --platform android --profile preview --no-wait --non-interactive
```

After the build completes, fetch the APK URL from `https://expo.dev/accounts/templeton_dc/projects/waecprep/builds` and share with the user for sideload install.

---

## 3. Locked Tech Stack — DO NOT CHANGE VERSIONS

```
Expo SDK:                51 (managed workflow)
react-native:            0.74.5
react:                   18.2.0
react-native-reanimated: 3.10.1 (EXACT — Reanimated 4 will break the build)
rive-react-native:       8.5.0 (9.x requires AGP 8.9+ which Expo SDK 51 lacks)
nativewind:              4.2.4
tailwindcss:             3.4.19
moti:                    0.30.0
```

### Critical config files — do not modify

- **`babel.config.js`** — inlines what `nativewind/babel` does but skips the `react-native-worklets/plugin` line (that plugin only exists in Reanimated 4 and breaks SDK 51 builds). Touching this re-introduces the bug.
- **`.npmrc`** — sets `legacy-peer-deps=true` so EAS Build respects the lockfile during `npm ci`.
- **`metro.config.js`** — has web stubs that map native-only packages (Rive, Lottie, Skia, WebView, expo-haptics, expo-av) to JS no-ops for web platform.
- **`tailwind.config.js`** — design tokens (canvas, ink, peach, lilac, mint, etc.). All your `className=` props expect these tokens.

### Rule of thumb when adding native modules

Always use `npx expo install <package>` (not raw `npm install`) so Expo's compatibility matrix picks the correct version for SDK 51. Adding a package via npm directly is how we got into Rive 9.x trouble.

---

## 4. Current Project Structure

```
mobile/
├── App.js                      # Root navigator (native-stack)
├── babel.config.js             # Hand-tuned — don't touch
├── metro.config.js             # Web stubs — don't touch
├── tailwind.config.js          # Design tokens
├── global.css                  # @tailwind directives
├── .npmrc                      # legacy-peer-deps=true
├── app.json                    # Expo config (owner: templeton_dc)
├── eas.json                    # EAS build profiles
├── DESIGN_BRIEF.md             # Your original design spec
├── ANTIGRAVITY_PROMPT.md       # Your kickoff prompt
├── ASSETS_TO_DOWNLOAD.md       # Asset shopping list
├── HANDOFF.md                  # THIS FILE
├── assets/
│   ├── lovable/                # 8 PNG hero icons (atom, brain, dna, etc.)
│   ├── lottie/                 # Lottie JSONs (your additions)
│   ├── rive/                   # .riv files
│   ├── 3d/                     # .glb models
│   ├── avatars/                # default user avatars
│   └── sounds/                 # SFX MP3s
└── src/
    ├── components/
    │   ├── AppShell.js
    │   ├── BottomNav.js
    │   ├── GameHub.js
    │   ├── Gradient.js         # LinearGradient wrapper
    │   ├── Header.js
    │   ├── LevelUpOverlay.js
    │   ├── PageTransition.js
    │   ├── RoastCard.js
    │   ├── SubjectCard.js
    │   ├── 3d/                 # Your 3D components
    │   │   ├── Avatar3D.js
    │   │   ├── Card3D.js
    │   │   └── SpinWheel.js
    │   ├── motion/             # Your motion primitives
    │   │   ├── Confetti.js
    │   │   ├── EmptyState.js
    │   │   ├── NumberRoll.js
    │   │   ├── Skeleton.js
    │   │   └── Toast.js
    │   └── primitives/
    │       └── MotiPressable.js
    ├── lib/
    │   ├── game-store.js       # AsyncStorage-backed game state (DO NOT MODIFY SHAPE)
    │   ├── subjects.js         # Subject metadata
    │   ├── confetti.js         # Lightweight burst trigger
    │   ├── utils.js            # cn() + COLORS constants
    │   ├── sounds.js           # expo-av wrapper
    │   ├── haptics.js          # expo-haptics wrapper
    │   └── spline-scenes.js    # Spline scene URLs
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── DuelScreen.js       # ✅ Supabase questions wired
    │   ├── PredictScreen.js    # ✅ Supabase predictions wired
    │   ├── ProfileScreen.js
    │   ├── QuestsScreen.js     # ✅ uses useGame for state
    │   ├── ShopScreen.js       # ✅ uses useGame for state
    │   ├── SpinScreen.js       # ✅ uses useGame for state
    │   ├── SeasonScreen.js     # ✅ uses useGame.seasonTier/seasonXp
    │   ├── TournamentScreen.js
    │   ├── SquadScreen.js
    │   ├── TutorScreen.js      # Pattern-matched responses (no real AI yet)
    │   ├── VaultScreen.js
    │   ├── SubjectScreen.js
    │   ├── NotificationsScreen.js
    │   ├── HistoryScreen.js
    │   ├── SettingsScreen.js
    │   ├── RegisterScreen.js   # ✅ saves to useGame.setProfile
    │   └── OnboardingScreen.js
    ├── services/
    │   └── api.js              # Supabase REST API client
    └── stubs/                  # Web-only no-op shims
```

---

## 5. Data Layer Reference

### 5.1 `useGame()` — the central game state hook

Located at `src/lib/game-store.js`. Persisted to AsyncStorage as `brainduel.game.v1`. Returns:

```js
const game = useGame();

// State (read)
game.level         // number
game.xp            // number
game.xpToNext      // number (formula: 300 + level * 75)
game.coins         // number
game.gems          // number
game.streak        // number (days)
game.seasonTier    // number (1-30)
game.seasonXp      // number (0-500, then rolls over)
game.spinAvailableAt  // ms epoch — next spin time
game.quests        // [{ id, title, desc, goal, progress, xp, coins, type, icon }]
game.powerups      // [{ id, name, desc, emoji, price, currency, owned }]
game.lastLevelUp   // ms epoch | null — triggers LevelUpOverlay
game.lastReward    // { kind, amount, ts } | null
game.profile       // { name, country, school, examType, subjects[], examYear, onboarded }
game.hydrated      // boolean — true after AsyncStorage load completes

// Actions (write)
game.addXp(n)                       // adds XP, may trigger level up
game.addCoins(n)
game.addGems(n)
game.progressQuest(id, by = 1)      // increments quest progress, capped at goal
game.claimQuest(id)                 // removes quest, credits XP+coins (if done)
game.buyPowerUp(id)                 // returns true if affordable
game.usePowerUp(id)                 // returns true if owned > 0
game.claimSpin({ kind, amount })    // sets 20h cooldown, credits reward
game.setSeasonTier(t)
game.resetLevelUp()                 // dismiss LevelUpOverlay
game.setProfile(partial)            // merge partial into profile
```

### 5.2 `API` — Supabase REST client

Located at `src/services/api.js`. Methods:

```js
import { API } from "../services/api";

// Get list of subjects with questions in the DB
await API.getSubjects()              // → ["Biology", "Chemistry", ...]

// Get questions for a subject (year optional, limit defaults 20)
await API.getQuestions(subject, year, limit)
// Returns: [{ id, subject, year, question_text, options: {A,B,C,D,E}, answer: "A", topic_cluster }]

// Get available years for a subject
await API.getYears(subject)          // → [2024, 2023, ...]

// Get topic predictions for a year (default 2026)
await API.predict(subject, year = 2026, topN = 10)
// Returns: [{ topic, probability, cluster, rank }]

// Get overall stats (optionally filtered by subject)
await API.getStats(subject)          // → { total: 4521, subjects: 9 }
```

### 5.3 Supabase tables (already populated)

**`questions`** — 4500+ rows of exam questions
```
id            uuid
subject       text  ("Biology", "Mathematics", ...)
year          int   (2010-2024)
question_text text
options       jsonb { "A": "...", "B": "...", "C": "...", "D": "...", "E"?: "..." }
answer        text  ("A" | "B" | "C" | "D" | "E")
topic_cluster int
```

**`predictions`** — ML-generated topic probabilities
```
subject       text
year          int   (predicted year, e.g. 2026)
topic         text  (e.g. "Organic Bonding")
probability   float (0.0-1.0)
topic_cluster int
rank          int   (1 = highest probability)
```

### 5.4 Helper: converting Supabase question to UI shape

DuelScreen needs `{ text, options: array, correct: index }`. Supabase gives `{ question_text, options: {A,B,C,D,E}, answer: letter }`. The `normalize()` helper in `src/screens/DuelScreen.js` does this — copy it where needed.

---

## 6. What's Wired vs What's Not

### ✅ Already wired to real data
- **PredictScreen** — calls `API.predict()` for 5 major subjects (Chemistry, Biology, Physics, Maths, English) for 2026. Falls back to a hardcoded list if offline.
- **DuelScreen** — calls `API.getQuestions(profile.subjects[0])` and shuffles 12 questions. Falls back to 3 hardcoded questions.
- **RegisterScreen** — writes name/country/school/examType/subjects/examYear/onboarded into `useGame().profile` via `setProfile()`.
- **QuestsScreen** — reads/writes quests via `useGame()` (claim removes them, progress increments).
- **ShopScreen** — `buyPowerUp` deducts coins/gems and increments owned count.
- **SpinScreen** — `claimSpin` sets 20h cooldown + credits reward via game-store.
- **SeasonScreen** — reads `seasonTier`/`seasonXp` from game-store.
- **ProfileScreen** — name/school read from `profile`. Stats `Streak`/`XP` partially wired.
- **HomeScreen Header** — level, XP, coins, gems all from `useGame()`.
- **LevelUpOverlay** — triggers when `lastLevelUp` is set.

### 🔧 Still dummy data — needs wiring

#### HomeScreen
- "Lagos Science vs King's College" hero — hardcoded school names. Replace with `profile.school` and a random opponent school from a list.
- "14-day streak" — should read `game.streak`.
- "Top 3% in Lagos" — fake. Either remove or wire to a `leaderboard` Supabase view.
- "+50 XP daily challenge" — hardcoded copy.

#### ProfileScreen
- Stats row hardcoded `["14d", "8.4k", "#12"]` — replace with `game.streak`, `game.xp`, and either a real rank or "—".
- School leaderboard `schools = [...]` array is hardcoded. Either:
  - Add a Supabase `leaderboard` view (recommended), or
  - Generate locally from a list of African + international schools

#### TournamentScreen
- `prizePool = 12500` and `players = 2847` hardcoded. Either:
  - Add a `tournaments` table with `id, starts_at, prize_pool, registered_count`
  - Or compute from a Supabase row count

#### SquadScreen
- `code = "BRN-92K4X"` is static. Generate a unique 8-char code per user (store in `profile.squadCode`).
- Rivals list is hardcoded — add to a `rival_schools` table or keep as static config.

#### VaultScreen
- Cards array is hardcoded with `unlocked: true/false` flags. Compute `unlocked` based on the user's mastery per subject (which would come from a separate `user_mastery` table you'd need to create, or compute on-the-fly from match history).

#### HistoryScreen
- Entire match list is dummy. Create a `match_history` table or persist locally via AsyncStorage on each duel completion.

#### NotificationsScreen
- Hardcoded list. Could be:
  - Derived from quest progress (e.g. "You completed Quest X")
  - Or a real `notifications` Supabase table

#### TutorScreen
- Uses pattern-matched dummy responses. Either:
  - Wire to Anthropic Claude API or OpenAI for real AI tutoring
  - Or expand the pattern-matching for more subjects/topics

#### SubjectScreen
- Topic progress in `subjects.js` is hardcoded. Should derive from real attempt history per topic.

#### SettingsScreen
- Toggles (sound, haptics, language, dark mode) don't persist. Add them to `useGame.profile.settings = {sound, haptics, language, theme}` and respect across the app.

### Suggested new Supabase tables to add

If you want fully real data, add these tables via Supabase dashboard:

```sql
-- User profiles (mirrors what's in AsyncStorage so it survives device wipes)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text,
  country text,
  school text,
  exam_type text,
  subjects text[],
  exam_year int,
  level int default 1,
  xp int default 0,
  coins int default 100,
  gems int default 5,
  streak int default 0,
  created_at timestamptz default now()
);

-- School leaderboard view
create view school_leaderboard as
select school, sum(xp) as total_xp, count(*) as students
from users
where school is not null
group by school
order by total_xp desc;

-- Match history
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  opponent_name text,
  subject text,
  my_score int,
  opp_score int,
  won boolean,
  xp_earned int,
  played_at timestamptz default now()
);

-- Tournaments
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz,
  prize_pool int default 12500,
  registered_count int default 0,
  status text default 'upcoming'
);

-- Tournament registrations
create table tournament_registrations (
  tournament_id uuid references tournaments(id),
  user_id uuid references users(id),
  primary key (tournament_id, user_id)
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  icon text,
  title text,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Squads
create table squads (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique,
  mode text check (mode in ('3v3','5v5')),
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table squad_members (
  squad_id uuid references squads(id),
  user_id uuid references users(id),
  primary key (squad_id, user_id)
);
```

After adding these via the Supabase SQL editor, extend `src/services/api.js` with the new methods (e.g. `API.getLeaderboard()`, `API.recordMatch()`, `API.getNotifications()`).

---

## 7. Build & Deploy

### Local development (Expo Go)

```bash
cd /Users/mac/Desktop/waec-prep/mobile
ulimit -n 65536      # required on macOS to avoid EMFILE crashes
npx expo start --lan
```

Open Expo Go app on phone (same WiFi) and scan the QR code.

### Cloud APK build (EAS)

```bash
cd /Users/mac/Desktop/waec-prep/mobile
EXPO_TOKEN=idiMR_zwbpilXnqAwJZRKcGJx9028Ylj6bw5lO9m ./node_modules/.bin/eas build \
  --platform android \
  --profile preview \
  --no-wait \
  --non-interactive
```

The command returns a build URL. Build takes ~8-12 minutes. Once `Status: finished`, download the `.apk` link from `https://expo.dev/accounts/templeton_dc/projects/waecprep/builds/<id>` and share with the user.

### iOS build

```bash
EXPO_TOKEN=... ./node_modules/.bin/eas build --platform ios --profile preview --no-wait --non-interactive
```

Requires the user to have an Apple Developer account (not currently set up). For now, focus on Android.

### Production app bundle (for Play Store later)

```bash
EXPO_TOKEN=... ./node_modules/.bin/eas build --platform android --profile production --no-wait --non-interactive
```

---

## 8. Debugging Failed Builds

When a build errors:

```bash
# Get error details + log URL
curl -s -X POST "https://api.expo.dev/graphql" \
  -H "Authorization: Bearer idiMR_zwbpilXnqAwJZRKcGJx9028Ylj6bw5lO9m" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { builds { byId(buildId: \"<BUILD_ID>\") { id status error { errorCode message } logFiles } } }"}' \
  | python3 -m json.tool

# Logs are brotli-compressed. Download and decode:
curl -s -o /tmp/log.br "<LOG_URL>"
brotli -d -k -f -o /tmp/log.txt /tmp/log.br
grep -iE "FAILED|Error:|Cannot find|BABEL|requires" /tmp/log.txt | head -30
```

Common failure modes already encountered + fixed:
- `Cannot find module 'react-native-worklets/plugin'` — fixed by inlining babel config (see `babel.config.js`)
- `rive-react-native requires compileSdk 36` — fixed by pinning to `8.5.0`
- `npm ERESOLVE` peer conflicts — fixed by `.npmrc` `legacy-peer-deps=true`
- `@react-native-async-storage/async-storage` version mismatch — pinned to `1.23.1`

---

## 9. Git Workflow

The project is on the branch you've been working on. Commit after each completed feature:

```bash
git add -A
git commit -m "feat(profile): wire school leaderboard to Supabase view"
```

Tags for safety:
- Current HEAD `6c5ea75b` has all your design + Claude's Supabase wires
- Tag a baseline before major changes: `git tag antigravity-final-design`

---

## 10. Where to Start (Recommended Order)

If you're picking up where Claude left off, here's the priority list:

1. **Verify build works** — run the EAS build command above; if it succeeds, download the APK and confirm on device that all screens render.
2. **Wire HomeScreen hero** — use `profile.school` for the user's school name; pick random opponent from a static list of African schools.
3. **Wire ProfileScreen stats** — replace hardcoded `["14d", "8.4k", "#12"]` with `game.streak`, formatted `game.xp`, and either a real rank or "—".
4. **Persist Settings** — extend `profile.settings` in game-store, wire toggles to write/read it, respect `theme: 'dark'` across the app (NativeWind supports `dark:` variants already).
5. **Track match history locally** — on DuelScreen result, push `{opp, subject, my, opp, won, ts}` to `profile.matches` (AsyncStorage). Read on HistoryScreen.
6. **Add Supabase tables (§6 SQL block)** — only if you want true cross-device data; otherwise everything can stay AsyncStorage.
7. **Real Tutor (optional)** — wire Anthropic Claude API or OpenAI to TutorScreen for actual AI responses (requires API key).
8. **Production polish** — splash screen, app icon, store listings.

---

## 11. The User's Pain Points (avoid these)

The user has been through multiple rounds of frustration. They explicitly do NOT want:

- ❌ Redesigning what's already designed. Layout, gradients, animations, component shapes are correct — only the data is missing.
- ❌ Adding new screens that aren't already in the codebase.
- ❌ Upgrading versions of locked packages.
- ❌ Replacing one dummy data source with another dummy data source.
- ❌ Long preamble explanations. Just do the work.

The user has been very clear: **frontend design is locked. Wire the data. Build the APK. Done.**

---

## 12. Quick Sanity Checks Before Shipping

Run these before declaring complete:

```bash
# Babel config still loads
node -e "const fn = require('./babel.config.js'); const c = fn({ cache: () => {} }); console.log('OK:', c.presets.length, 'presets,', c.plugins.length, 'plugins');"

# All dependencies install cleanly
npm install --legacy-peer-deps

# Critical versions still pinned
node -e "
const p = require('./package.json').dependencies;
const checks = {
  'react-native': '0.74.5',
  'react-native-reanimated': '3.10.1',
  'rive-react-native': '^8.5.0',
  'expo': '~51.0.0',
  '@react-native-async-storage/async-storage': '1.23.1',
};
let ok = true;
for (const [k, v] of Object.entries(checks)) {
  if (p[k] !== v) { console.log('DRIFT:', k, '→', p[k], '(expected', v + ')'); ok = false; }
}
console.log(ok ? '✓ all versions locked' : '✗ version drift detected');
"

# Final EAS build
EXPO_TOKEN=idiMR_zwbpilXnqAwJZRKcGJx9028Ylj6bw5lO9m ./node_modules/.bin/eas build --platform android --profile preview --no-wait --non-interactive
```

---

## 13. Contact Points

- **Supabase dashboard:** https://supabase.com/dashboard/project/wbxyakpfjwtoxwqefjap
- **Expo dashboard:** https://expo.dev/accounts/templeton_dc/projects/waecprep
- **EAS builds list:** https://expo.dev/accounts/templeton_dc/projects/waecprep/builds

---

## Summary for the Agent

**You have:**
- Working frontend (your design)
- Locked toolchain (don't drift versions)
- Valid Supabase + Expo credentials
- `game-store` (full AsyncStorage state)
- 2 screens already wired to real Supabase (DuelScreen, PredictScreen)

**You need to:**
1. Confirm the current EAS build succeeds → share APK with user
2. Wire the remaining screens to real data (per §6)
3. Optionally add Supabase tables for leaderboard / matches / notifications
4. Trigger a final production-ready EAS build
5. Hand the APK URL back to the user

**Don't redesign anything.** The user has spent multiple rounds rejecting redesigns. Wire data, build, deliver.
