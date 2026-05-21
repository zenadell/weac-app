# BrainDuel — Design & Implementation Brief

> **For Google Antigravity (or any agent designing/implementing the UI)**
>
> This is a React Native (Expo SDK 51) mobile app. Your job is to design and implement every screen, component, animation, and interaction described below. **Do not touch the data layer** — Supabase queries, AsyncStorage, and game state are already wired up by Claude. You are responsible for everything visual, interactive, and animated.

---

## 1. Project Identity

**Name:** BrainDuel (formerly WAECPrep)
**Category:** Gamified exam prep — duels, predictions, mastery, rivalries
**Audience:** Students aged 14-22 preparing for high-stakes exams (WAEC, JAMB, NECO, A-Levels, SAT, GCSE, BECE) across Nigeria, Ghana, Kenya, South Africa, UK, US, India
**Tone:** Bold, premium, addictive — think Duolingo × Clash Royale × Apple Music
**Personality words:** Energetic, confident, modern, slightly cheeky, never boring
**Tagline:** *"Crush exams. Crown your school."*

The app is **not** a passive study tool. Every screen should feel like the user is *playing* something — there must be tension, reward, social pressure, and visual delight on every tap.

---

## 2. Locked Tech Stack — DO NOT CHANGE

```
Runtime: Expo SDK 51 (managed workflow)
React Native: 0.74.5
React: 18.2.0
Language: JavaScript (no TypeScript)

Styling: NativeWind v4.2.4 + Tailwind 3.4.19
  - All className= props use Tailwind syntax
  - Custom Lovable tokens defined in tailwind.config.js (see §4)

Animation:
  - Moti (declarative — like framer-motion for RN)
  - react-native-reanimated 3.10.1 (pinned — DO NOT upgrade)
  - React Native Animated API for simple transforms
  - lottie-react-native for vector animations
  - @shopify/react-native-skia for high-performance custom drawing
  - react-native-svg 15.2.0 for static SVGs

Icons: lucide-react-native (same icon set as the original Lovable design)
Images: expo-image (with blurhash placeholders)
Gradients: expo-linear-gradient (wrapped in <Gradient name="peach"> helper)
Navigation: @react-navigation/native-stack v6
Persistence: @react-native-async-storage/async-storage
Haptics: expo-haptics
Audio (optional): expo-av for SFX

3D / Spatial:
  - @react-three/fiber + expo-gl + three for true 3D
  - rive-react-native for interactive vector animations with state
  - WebView fallback for Spline scenes when 3D is too heavy

Backend (already wired — do not modify):
  - Supabase REST API (questions, predictions tables)
  - api.js exposes API.predict(), API.getQuestions(), API.getStats(), etc.
  - GameStore (Context + AsyncStorage) for XP/coins/gems/quests/profile
```

**Babel config is hand-tuned** (`babel.config.js`) because `nativewind/babel` hardcodes a Reanimated-4-only plugin. Do not run `npx expo install --fix` — it will undo this.

---

## 3. Design System

### 3.1 Color Tokens

Defined in `tailwind.config.js`. Use class names like `bg-canvas`, `text-ink`, `bg-peach`. **Never use raw hex values in components.**

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FBF8F0` | Warm off-white app background |
| `ink` | `#1B1A2E` | Near-black text & primary buttons |
| `card` | `#FFFFFF` | Card surfaces |
| `muted-foreground` | `#7B7995` | Secondary text |
| `border` | `#E7E3D6` | Hairline borders |

**Pastel gradient palette** (always used as two-stop gradients via `<Gradient name="X">`):

| Name | Start → End | Vibe |
|---|---|---|
| `peach` | `#FF9E80 → #F06292` | Primary CTA, hero, victory |
| `lilac` | `#CE93D8 → #9575CD` | Premium, season pass, AI |
| `mint` | `#80CBC4 → #4DB6AC` | Success, progress, biology |
| `butter` | `#FFF176 → #FFD54F` | Coins, rewards, achievements |
| `sky` | `#90CAF9 → #5C6BC0` | Cool, calm, chemistry |
| `rose` | `#F8BBD0 → #EF5350` | Streak, danger, English |
| `coral` | `#F06292` | Accent only, never as bg |

### 3.2 Typography

Font family: **Outfit** (variable weight, loaded via `expo-font` from `@expo-google-fonts/outfit`)

| Style | Tailwind | Use |
|---|---|---|
| Hero | `text-[2.4rem] font-semibold tracking-tight leading-[1]` | Subject hero titles |
| H1 | `text-[2rem] font-semibold tracking-tight leading-tight` | Page headers |
| H2 | `text-xl font-semibold` | Section titles |
| Body | `text-sm` | Default body |
| Caption | `text-xs text-muted-foreground` | Metadata, labels |
| Tabular | `tabular-nums` | All numbers (scores, XP, coins) |

**Never use** `font-bold` for body — only `font-semibold` (600). Reserve 700+ for big numbers.

### 3.3 Spacing & Radius

- Base unit: 4pt
- Padding scale: `p-2 / p-3 / p-4 / p-5 / p-6 / p-7`
- Card padding: typically `p-5` or `p-6`
- Page horizontal: `px-6`
- Border radii: `rounded-2xl` (16) for inputs, `rounded-3xl` (24) for cards, `rounded-[28px]` for elevated cards, `rounded-[32px]` and `rounded-[36px]` for heroes, `rounded-full` for chips/avatars

### 3.4 Shadows

Two presets — always use the JS objects, not Tailwind:

```js
const shadowSoft = { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 };
const shadowPop  = { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 10 };
```

Apply `shadowSoft` to all white cards. `shadowPop` to gradient hero cards and modals.

### 3.5 Ring / Border Style

Every elevated white card gets `border border-black/5` (a hairline border). Gradient cards get `border border-black/5` too — it adds subtle definition.

---

## 4. Animation Philosophy — THIS IS CRITICAL

The app must feel **alive**. Every interaction should respond physically. Aim for **Apple-tier polish**.

### 4.1 The Three Laws

1. **Nothing snaps.** Every state change must transition. If something appears, it fades + scales + slides in. If something disappears, it shrinks + fades out.
2. **Everything bounces.** Use spring physics (Moti `type: "spring"`) by default. Linear easing is forbidden except for continuous loops.
3. **Touch is sacred.** Every Pressable must have `whileTap={{ scale: 0.96 }}` or equivalent. Add `expo-haptics` light impact on primary actions.

### 4.2 Default Transitions

```js
// Standard entrance
from={{ opacity: 0, translateY: 16, scale: 0.96 }}
animate={{ opacity: 1, translateY: 0, scale: 1 }}
transition={{ type: "spring", damping: 22, stiffness: 300 }}

// List stagger
transition={{ delay: index * 50, type: "spring" }}

// Reward / celebration
transition={{ type: "spring", damping: 12, stiffness: 200 }} // bouncier
```

### 4.3 Specific Animation Requirements

| Surface | Required Animation |
|---|---|
| Page enter | Fade + 12px translateY, 450ms ease-out |
| Tab switch | Shared element on the active pill (Moti `layoutId` equivalent) |
| Card press | Scale to 0.97 + slight downward translateY |
| Number increment (XP, coins) | Roll-up counter, 600ms ease-out |
| Progress bar fill | Spring, 1000ms, with overshoot |
| Modal open | Scale from 0.85 with rotateY tilt + backdrop blur fade-in |
| Streak flame | Infinite scale [1, 1.15, 1] + slight rotate |
| Live duel indicator | Pulsing dot — scale [1, 1.5, 1] + opacity [1, 0.5, 1] |
| Hero rings (home) | Continuous 360° rotate over 30s + 5s vertical bob |
| Tournament countdown | Each second digit flips with vertical translate |
| Spin wheel | 6 full rotations + ease-out cubic, 4.2s |
| Confetti | On every reward — Skia particle burst, 60 particles |
| Level-up | Full-screen takeover, conic-gradient sweep behind a giant number |
| Correct answer | Card flashes green + checkmark draws on |
| Wrong answer | Card shakes horizontally + red border pulse |

### 4.4 Loading / Skeleton States

- **No spinners** for content. Use shimmer skeletons that match the card shape.
- Skeletons use `bg-canvas` with an animated `opacity` loop [0.4, 0.7, 0.4] every 1.4s.
- For network requests >300ms, show skeletons immediately.

---

## 5. 3D & Motion Asset Sources

The user explicitly wants **unique 3D motion elements**. Here's where to source them:

### 5.1 Pre-built 3D Scenes (recommended for hero areas)

- **Spline** ([spline.design](https://spline.design)) — Export as web URL, load via `react-native-webview`. Use for: home hero background, level-up celebration, tournament throne. Free tier sufficient.
- **Rive** ([rive.app](https://rive.app)) — Use `rive-react-native`. Use for: animated icons, the spin wheel center, the Nova AI avatar, button states. Rive Community has thousands of free animations.

### 5.2 Vector Animations

- **LottieFiles** ([lottiefiles.com](https://lottiefiles.com)) — Use `lottie-react-native`. Required animations to source:
  - Confetti burst (multiple variants for win/level-up/quest-claim)
  - Streak flame (animated fire)
  - Trophy unlock
  - Empty state illustrations
  - Loading state for AI thinking
  - Heart pulse for live duel
  - Coin shower for big rewards
  - Search animation for matchmaking
- Save Lottie JSON files to `assets/lottie/` with descriptive names.

### 5.3 True 3D (use sparingly — performance-heavy)

- **react-three-fiber + expo-gl + three** for:
  - The **Mastery Vault** card flip when tapping a collectible (3D card with rarity-based foil shader)
  - The **Spin Wheel** can optionally be true 3D with a wood-textured rim and lighting
  - **Trophy display** in profile (rotating 3D trophy model)
- Models: download `.glb` files from [Sketchfab](https://sketchfab.com) (filter by "downloadable" + CC license) — trophies, books, atoms, brains, etc.

### 5.4 Skia for Custom Effects

Use `@shopify/react-native-skia` for:
- Confetti particle systems
- The XP bar's animated "shine" sweep when filling
- Card glow effects on the rarest mastery cards (animated shader gradient)
- The "energy ring" behind the streak counter
- Conic gradient sweep in the LevelUpOverlay

### 5.5 Static Image Assets (already in repo)

Located in `assets/lovable/`:
- `atom.png` — Physics
- `brain.png` — Chemistry
- `books.png` — English / Literature
- `calculator.png` — Maths
- `dna-helix.png` — Biology
- `hero-rings.png` — Home hero decoration (rotating)
- `swords.png` — Duel matchmaking
- `trophy.png` — Achievements, vault MVP card

If new subject icons are needed (Economics, Government, Geography, etc.), source matching-style 3D icons from [iconscout.com](https://iconscout.com/3d-illustrations) or [3dicons.co](https://3dicons.co).

---

## 6. Navigation Architecture

Single root native stack. No tabs at runtime — the BottomNav is a custom floating component rendered by `AppShell` for screens that should have it.

### 6.1 Route List (registered in `App.js`)

```
- Register      (entry if !profile.onboarded)
- Home          (main landing)
- Duel
- Predict
- Profile
- Quests
- Shop
- Spin
- Season
- Tournament
- Squad
- Tutor
- Vault
- Subject       (params: { id })
- Notifications
- Settings
- History
- Papers        (new — past papers browser)
- Onboarding    (new — 3-slide intro before Register)
```

### 6.2 BottomNav Items

Floating pill at `bottom-6 left-4 right-4 mx-auto`. Show only on top-level screens (Home, Duel, Predict, Vault, Profile):

| Position | Label | Icon | Color (active) | Route |
|---|---|---|---|---|
| 1 | Home | `Home` | `peach` | Home |
| 2 | Duel | `Swords` | `coral` | Duel |
| 3 | Predict | `Sparkles` | `royal` | Predict |
| 4 | Vault | `Layers` | `teal` | Vault |
| 5 | Me | `User` | `sand` | Profile |

Active state: pill background = `color-mix(active-color 18%, transparent)`, icon + label colored, label slides in from width 0. Use Moti `layoutId="navPill"` equivalent (shared transition).

---

## 7. Screen-by-Screen Specifications

### 7.1 Onboarding (NEW — 3 slides before Register)

**Purpose:** Sell the app in 15 seconds. User can swipe or tap "Skip".

| Slide | Hero | Headline | Sub | Background |
|---|---|---|---|---|
| 1 | Rive of two avatars dueling, scores ticking up | "Duel anyone. Anywhere." | "60-second exam sprints. Real opponents. Real stakes." | gradient-peach |
| 2 | Spline-rendered crystal ball with floating topics | "AI sees the future" | "Topic predictions from 15 years of exam data." | gradient-lilac |
| 3 | Lottie of trophy raining coins | "Climb your school." | "Rep your school. Win seasons. Collect Mythic cards." | gradient-mint |

Animations: hero scales in spring 280/18, headline fades up 200ms after, sub fades up 100ms after that. Page indicator dots at bottom — active dot is `w-8 h-2 rounded-full bg-ink`, inactive `w-2 h-2 bg-ink/20`. Smooth morph between states. CTA "Get started →" at bottom.

### 7.2 Register (5 steps)

A clean multi-step form with progress bar at top. **No card layouts** — single-column, generous spacing. Each step transitions horizontally (slide left to advance).

| Step | Fields | Special UI |
|---|---|---|
| 1 | Name + Country | Country picker is a horizontal scrolling chip strip with country flags (use `react-native-flagkit` or unicode flags) |
| 2 | School + Class/Grade | "Don't see your school?" link opens a textinput |
| 3 | Exam type | Big 2-column grid of gradient cards (WAEC peach, JAMB sky, NECO mint, A-Levels lilac, SAT butter, GCSE rose, BECE coral, Other ink) — each card has an emoji + name. Selected card scales 1.05 + glows. |
| 4 | Subjects (max 9) | Pill chips wrap in 3 columns, multi-select. Counter "X/9 selected" updates with bounce. |
| 5 | Exam year | Year picker: horizontal scroll cards with year, distance-to-exam in days, and a tiny progress hint |

Bottom CTA: gradient-peach pill "Continue →" (becomes "Let's go! 🚀" on step 5). Haptic light on tap.

### 7.3 Home

The most important screen. Layout from top to bottom:

1. **Header** (`<Header />` component) — greeting + name + level XP bar + coins/gems/notification pills
2. **Hero Duel card** — gradient-peach 36px-rounded card. Live indicator pulsing, "Lagos Science vs King's College" (use user.school dynamically), 60-second sprint label, "Enter Arena" pill button. **Background: rotating `hero-rings.png` + optional Spline scene WebView at 20% opacity**.
3. **Streak strip** — white card, butter gradient icon tile with `Flame`, "X-day streak", school rank, three overlapping avatar circles on right
4. **Daily Challenge banner** — gradient-lilac, animated `Target` icon, "Daily challenge · +50 XP"
5. **GameHub** — 6-card 2×3 grid: Tournament, Squad, Spin, Quests, Season, Shop (each gradient + icon + label + sub + optional badge)
6. **Subjects Bento** — first subject is full-width-large (h-48), rest are 2-column h-44. Each is a `<SubjectCard>` with gradient background, mastery % circular SVG, floating 3D PNG.
7. **Achievement banner** — "Weekly MVP card unlocked" — leads to Vault. Trophy PNG rotates gently.

**Critical:** every section staggers in on mount. The whole page should feel like it's "loading itself" gracefully.

### 7.4 Duel — 3 phases, all in one screen

#### Phase 1: Matching
- Centered: 3 pulsing concentric coral circles
- Inner: gradient-peach circle, swords PNG rotating inside (or **Rive sword animation** — preferred)
- "Searching arena…" + animated dots
- After 2.8s → transition to Phase 2

#### Phase 2: Playing
- Top: VS scoreboard card — your gradient circle (peach), score, vs opponent gradient circle (lilac), score. Center: timer with key-on-change scale animation. Timer turns coral when <10s.
- Subject badge pill (mint/20 bg)
- Question text (28pt semibold)
- 4 answer cards (A/B/C/D label tile + option text). On tap: correct = mint border + bg + Lottie checkmark draw-on. Wrong = coral border + shake + opponent's score increments.
- Live opponent score increments randomly via simulated activity

#### Phase 3: Result
- Big "Victory!" or "So close." headline
- `<RoastCard>` — gradient-peach, two avatars, VS badge, score 4xl, animated glowing orbs in corners, witty roast text in dark inset card, "+24 XP" / "5× combo" footer
- Share button (uses `react-native-share` for image export — use `react-native-view-shot` to snapshot the RoastCard)
- "Back home" secondary button
- Confetti from Lottie on victory

### 7.5 Predict

- Header: "AI Prophecy" pill chip + huge "What's coming in WAEC 2026" headline
- **Topic probability card** (white, rounded-3xl): list of subjects with animated horizontal bars filling left-to-right, % number on the right
- **Alert cards** below — gradient peach "High volatility", gradient mint "Pattern locked in", each with an icon tile and warm copy
- (NEW — add) Tap any subject row → expand to show top 5 topics for that subject with mini probability bars

### 7.6 Profile

- Header: round avatar with peach gradient border ring (Lottie crown if level ≥10), name, school
- Stats row: 3 gradient cards (Streak, XP, Rank)
- School leaderboard table — white card, 4 rows, user's row highlighted with `bg-peach/10` and "YOU" badge
- Settings rows: My school, Match history, Preferences, Privacy
- **NEW**: Add a "Share my profile" button that exports a stat card image (use `react-native-view-shot`)

### 7.7 Quests

- Header back button + "Today's missions" + "Earn XP, coins & gems"
- Section: Daily — white cards, emoji icon tile, title, desc, +XP / +coins chips, claim button on right. Progress bar at bottom.
- Section: Weekly — same but with gradient-lilac background and white text
- Claimed quests disappear with scale-out + slide-up animation, confetti burst on claim
- Empty state: "All quests claimed. Fresh ones drop at midnight." with a Lottie of a sleeping cat

### 7.8 Shop

- Header back + "Power shop" + coin/gem balance pills
- Section: Power-ups — 2-column grid of white cards. Each: large emoji (animated bounce on idle), name, desc, "x{owned}" badge if any, ink-colored buy button at bottom. Tap → if affordable, success toast slides up + confetti. If not, card shakes horizontally.
- Section: Bundles — wide gradient cards (peach, lilac, mint), with emoji, name, desc, big price chip on right
- **NEW**: Add a "Featured today" banner at top — animated Lottie gift box, "+200% bonus coins on Pro Pack until midnight"

### 7.9 Spin

- Centered wheel: 8 segments with reward labels. **Strong recommendation: use Rive for the wheel** — it can do the spin physics natively with realistic deceleration. Otherwise use SVG + Reanimated.
- Pointer triangle at top in ink color
- Big gradient-peach "Spin now · Free" pill button at bottom
- After spin: reward modal with Lottie confetti and the reward in huge text
- Daily cooldown: button becomes "Come back in HH:MM:SS" with live countdown

### 7.10 Season

- Hero card: gradient-lilac with conic-gradient sweep behind tier number. Huge "12" tier number. Progress bar "Tier 12 → Tier 13" with XP count. "Season ends in 14 days" footer.
- Toggle: Free / Pro (Pro has gradient-peach background when active, Crown icon)
- 30-tier scroll list: each row = tier number (gradient circle if past, canvas circle if locked), reward name, claim button (ink if claimable, Check if claimed, Lock if locked)
- Pro CTA banner at top of tier list if not Pro: "Unlock Pro for ₦1500 — 2× XP & exclusive cards"

### 7.11 Tournament

- Hero: gradient-lilac giant card with Crown badge, "Tonight's Throne Bracket", "Doors open at 7:00 PM · 64 seats"
- **Countdown clock**: 3 dark inset tiles (HRS / MIN / SEC). Each digit change is animated — old digit slides up out, new digit slides up in.
- "Reserve your seat (free)" pill button (becomes mint "✓ You're registered" on tap)
- Stats row: Prize pool (gradient-peach, Trophy icon) + Registered count (gradient-butter, Users icon)
- Champion rewards list: 5 rows (1st/2nd/3rd/Top 8/Top 32) with coins/gems chips
- "How it works" — 3 step cards
- Bottom toast on registration: "🔔 Reminder set for 6:55 PM"

### 7.12 Squad

- Header back + "Squad Battles"
- Mode switcher: 3v3 / 5v5 segmented control. Active option has gradient-peach background. Smooth Moti shared transition.
- Squad roster card (white, rounded-[28px]): rows of teammates. Empty slots have UserPlus icon + "Invite" button. Bottom: invite code in canvas-bg pill + Copy button (Copied! state with check icon, toast: "Code copied — paste in WhatsApp 🚀")
- Find rival squad CTA — gradient-peach button with Swords icon
- Rival schools grid (2×2): gradient cards with Users icon, school name, player count, win %

### 7.13 Tutor (Nova AI Chat)

- Header back + animated Nova avatar (Rive recommended — eyes blink, body breathes) + "Nova" + "AI tutor · online"
- Messages scroll: AI bubbles white left-aligned, user bubbles gradient-peach right-aligned, both with subtle pop-in animation
- **Typing indicator**: 3 royal dots bouncing in sequence (Lottie or Moti)
- Suggestion chips above input on first message: "Explain photosynthesis like I'm 12", "Solve: 2x² + 5x − 3 = 0", "What's likely in Chemistry 2026?"
- Input bar: white rounded card with TextInput + ink-colored Send button
- **3D element**: Nova avatar should have a subtle 3D feel — either Rive with depth shading, or a small Spline scene in the header

### 7.14 Vault

- Header: "Mastery vault" + "4 of 12 collected" big number
- Filter chips horizontal scroll: All / Legendary / Mythic / Epic / Rare / Common. Active chip = bg-ink.
- 2-column grid of mastery cards. Each: gradient-bg of card's color, rarity pill top-left, card # top-right (`#0001`), centered floating 3D image (the PNG bounces with random delay per card), name + subject at bottom. Locked cards: bg-canvas + giant "?" + opacity 60%.
- **Tap a card** → full-screen modal with **3D card flip animation** (use react-three-fiber for a true 3D card mesh, or Skia 2D rotate-Y simulation). Modal shows: rarity badge, name, subject, lore text, and an "Equip as profile frame" button.
- **3D rarity foil shader** (Skia): Mythic cards have an animated holographic gradient sweep on the card surface that responds to tilt (use `expo-sensors` accelerometer).

### 7.15 Subject ($id)

- Hero: full-bleed gradient card matching the subject's color, subtitle ("Genetics & Ecology"), huge subject name, mastery progress bar + %. The subject's PNG bounces in bottom-right corner. **Optional Spline 3D scene** as background.
- Action grid 2×2: Continue lesson (peach), Quick duel (lilac), Past papers (sky), AI tutor (mint). Each is a small gradient card with icon + label.
- Topics list: each row = 2-digit number tile + topic name + minutes + progress bar filled with the subject's gradient
- Bottom CTA: full-width ink button "Start a duel in {subject}"

### 7.16 Notifications

- List of notification cards: each has a gradient icon tile + title + time-ago. Tap → relevant route.
- Pull-to-refresh: custom Lottie of a chemistry beaker bubbling
- Empty state: Lottie of a paper plane flying

### 7.17 Settings

- Section: Account (Edit profile, My subjects, Exam year)
- Section: Preferences (Sound effects toggle, Haptic feedback toggle, Language picker, Dark mode toggle — **support full dark theme!**)
- Section: Data (Privacy & data, Export my data)
- Sign out (coral text)
- Below all: app version + "Built with ❤️ in Lagos"

### 7.18 History

- Match list: each row = W/L gradient circle (mint for W, rose for L) + opponent name + subject + time-ago + score on right
- Filter chips at top: All / Wins / Losses / By subject
- Tap row → expand to show full RoastCard for that match

### 7.19 Papers (NEW)

- Header: "Past papers"
- Year selector horizontal scroll (2020-2025), active year = gradient-peach pill
- Subject grid 2-column: each card shows subject icon + name + # of questions
- Tap subject → question list view with filter "All / Unattempted / Wrong / Bookmarked"

---

## 8. Components Library

Create in `src/components/`. All components use NativeWind classes + Moti for animations.

### 8.1 Existing (already implemented — improve, don't replace)

- `AppShell` — flex-1 bg-canvas wrapper + BottomNav
- `BottomNav` — floating pill with active layoutId animation
- `PageTransition` — fade + translateY entrance for all routes
- `Header` — greeting + level XP + balance pills
- `GameHub` — 6-card grid
- `SubjectCard` — gradient + percent + floating image
- `RoastCard` — duel result share card
- `LevelUpOverlay` — full-screen modal
- `Gradient` — LinearGradient wrapper with `name` prop

### 8.2 New components to build

- **`<MotiPressable>`** — wraps Pressable with default `whileTap` scale + haptic
- **`<Confetti>`** — Skia particle burst, configurable colors and origin
- **`<NumberRoll>`** — animated counter, takes `value` prop, rolls digits
- **`<Skeleton>`** — shimmer placeholder, takes `width`, `height`, `rounded` props
- **`<EmptyState>`** — Lottie + headline + sub + CTA, used everywhere
- **`<RiveAnimation>`** — wrapper for rive-react-native with prop defaults
- **`<LottieView>`** — wrapper with loop / autoplay defaults
- **`<Toast>`** — slides up from bottom-28, auto-dismisses 1.6s
- **`<ProgressRing>`** — circular progress SVG, animated stroke offset
- **`<TabSwitcher>`** — segmented control with shared layoutId pill
- **`<Card3D>`** — react-three-fiber card with tilt-on-touch + rarity foil shader (for Vault)
- **`<SpinWheel>`** — Rive-based wheel with API for `spin(targetIndex)`
- **`<Avatar3D>`** — for Nova in Tutor screen, optional 3D head

### 8.3 Atomic Building Blocks

- `<Chip>` — rounded-full pill, variants: ink, gradient, ghost
- `<IconTile>` — square colored bg with centered icon, sizes sm/md/lg
- `<StatPill>` — for coin/gem/streak counts
- `<SectionHeader>` — `text-sm font-semibold text-muted-foreground px-1`

---

## 9. Dark Mode Support

The app currently defaults to light. Add a full dark theme:

- `bg-canvas` → `#0E0E16` (deep navy-black)
- `text-ink` → `#F5F2E8` (warm cream)
- `bg-card` → `#1A1A28`
- Gradients stay the same (they pop more on dark!)
- Shadows lose opacity, add subtle `border-white/5`

Use NativeWind v4 dark variant: `dark:bg-card dark:text-ink-dark`. Toggle in Settings, persist to AsyncStorage as `theme: 'light' | 'dark' | 'system'`.

---

## 10. Sound Design (Optional but Strongly Encouraged)

Tasteful SFX make the app feel premium. Use `expo-av`. Source from [Mixkit](https://mixkit.co/free-sound-effects/) or [Pixabay](https://pixabay.com/sound-effects/) (free, royalty-free).

Required sounds:
- Tap (subtle wood tick)
- Correct answer (positive chord)
- Wrong answer (descending dink)
- Level up (triumphant sting)
- Coin gain (mario-style cha-ching, short)
- Streak extended (whoosh)
- Match found (radar ping)
- Tournament countdown last 10 seconds (clock tick)

Add a master toggle in Settings → "Sound effects".

---

## 11. Performance Requirements

- 60fps on mid-tier Android (Tecno Camon, Infinix Note, Samsung A23)
- Memory: < 250MB
- Cold start: < 2.5s to interactive
- Use `react-native-fast-image` (or `expo-image` with blurhash) for all images
- Lazy-load Vault 3D scenes — only render the focused card in 3D
- Virtualize long lists with `FlashList` from Shopify (faster than FlatList)
- Reanimated worklets run on UI thread — never JSI bridge for animations

---

## 12. Accessibility

- Min touch target: 44×44pt
- Color contrast: 4.5:1 minimum (test all gradient bg + white text combos)
- All Pressables: `accessibilityLabel` set
- Animations: respect `useReducedMotion()` (Moti supports this)
- Font scales: respect system text size (use rem-equivalent multipliers)
- VoiceOver / TalkBack: every interactive element labeled

---

## 13. File Structure (final)

```
mobile/
├── App.js                         # Root navigator
├── babel.config.js                # DO NOT TOUCH — hand-tuned for Reanimated 3.10
├── tailwind.config.js             # Design tokens
├── metro.config.js                # NativeWind metro integration
├── global.css                     # @tailwind directives
├── assets/
│   ├── lovable/                   # Original PNGs (atom, brain, etc.)
│   ├── lottie/                    # JSON animations
│   ├── rive/                      # .riv files
│   ├── 3d/                        # .glb models
│   └── sounds/                    # .mp3 SFX
├── src/
│   ├── components/                # All UI components
│   │   ├── primitives/            # MotiPressable, Chip, IconTile, etc.
│   │   ├── motion/                # Confetti, NumberRoll, Skeleton, etc.
│   │   ├── 3d/                    # Card3D, SpinWheel, Avatar3D
│   │   └── (existing ones)
│   ├── screens/                   # One file per route
│   ├── lib/
│   │   ├── game-store.js          # DON'T TOUCH — Claude owns this
│   │   ├── subjects.js            # DON'T TOUCH
│   │   ├── utils.js               # DON'T TOUCH
│   │   ├── confetti.js            # DON'T TOUCH
│   │   ├── haptics.js             # NEW — wraps expo-haptics
│   │   ├── sounds.js              # NEW — wraps expo-av
│   │   └── theme.js               # NEW — dark mode hook
│   └── services/
│       └── api.js                 # DON'T TOUCH — Claude owns Supabase queries
└── DESIGN_BRIEF.md                # this file
```

---

## 14. What Claude (the data agent) will handle — DO NOT TOUCH

- All `services/api.js` Supabase REST calls
- `lib/game-store.js` — game state, XP/coins/gems mutations, quest progression, AsyncStorage persistence
- `lib/subjects.js` — subject data dictionary
- Real exam data wiring: replace dummy `question` constant in Duel with `API.getQuestions(subject, year)`, replace dummy probability bars in Predict with `API.predict(subject, 2026)`, etc.
- User profile persistence (`profile` field in game-store)
- Onboarding completion flag

**Your job is to make these screens look incredible. Claude's job is to make them work with real data.**

For any UI that needs data, just call `useGame()` for game state, or accept the existing prop shapes. The data structure for each:

```js
// useGame() returns
{
  level: number, xp: number, xpToNext: number,
  coins: number, gems: number, streak: number,
  seasonTier: number, seasonXp: number,
  quests: [{ id, title, desc, goal, progress, xp, coins, type, icon }],
  powerups: [{ id, name, desc, emoji, price, currency, owned }],
  profile: { name, country, school, examType, subjects: [], examYear, onboarded },
  spinAvailableAt: ms,
  lastLevelUp: ms | null,
  addXp(n), addCoins(n), addGems(n),
  progressQuest(id, by), claimQuest(id),
  buyPowerUp(id), usePowerUp(id),
  claimSpin({kind, amount}),
  setProfile(partial), resetLevelUp(),
}

// API.predict(subject, year, topN) returns
[{ topic, probability, cluster, rank }]

// API.getQuestions(subject, year, limit) returns
[{ id, subject, year, question_text, options: {A,B,C,D,E}, answer, topic_cluster }]
```

---

## 15. Deliverables Checklist

Before declaring "done", every screen must:

- [ ] Match the Tailwind class style (no inline styles except for shadow JS objects)
- [ ] Use the `<Gradient>` helper for all gradient backgrounds (never raw LinearGradient)
- [ ] Use `lucide-react-native` icons (no emoji as icons, except for explicit emoji UI like quest icons)
- [ ] Have a page transition (Fade + Y)
- [ ] Have at least 3 staggered MotiView entrances
- [ ] Have at least 1 looping animation (subtle, not distracting)
- [ ] Have proper loading skeletons (no spinners for content)
- [ ] Have an empty state (Lottie + headline)
- [ ] Have proper error handling (toast for failures)
- [ ] Pass dark mode visually
- [ ] All Pressables: tap scale + haptic + sound
- [ ] All animations respect reduced-motion preference
- [ ] No console warnings on render
- [ ] 60fps scroll on mid-tier Android

### Animation Audit per Screen

- [ ] Home: hero rings rotate, streak flame pulse, daily challenge target shake, game hub stagger, subject cards stagger, trophy rotate
- [ ] Duel: matching pulse rings + sword rotate, score key animation, answer card press feedback, result confetti
- [ ] Predict: probability bars roll up, alert cards slide in
- [ ] Profile: avatar ring pulse, stats counter roll, leaderboard stagger
- [ ] Quests: card slide-in, progress bar fill, claim confetti
- [ ] Shop: power-up cards stagger, emoji bounce on idle, denied shake, purchase confetti
- [ ] Spin: wheel realistic spin physics, pointer wiggle on stop, reward modal
- [ ] Season: tier progress fill, tab switch shared transition, claim animation
- [ ] Tournament: countdown digit flip, register button morph, registered toast
- [ ] Squad: mode switcher shared transition, roster row slide-in, copy code toast
- [ ] Tutor: message bubble pop-in, typing dots bounce, Nova avatar idle breathing
- [ ] Vault: card grid stagger, modal scale+rotate-Y open, holographic foil shader on Mythic
- [ ] Subject: hero PNG bounce, action card press, topic progress fill, CTA pulse

---

## 16. References & Inspiration

- **Duolingo** — gamification psychology, streak design, character animation
- **Clash Royale** — card rarity treatment, chest opening animations
- **Apple Fitness+** — gradient palette, motion language, premium feel
- **Discord** — chat UI for Tutor screen
- **TikTok** — share-card design for RoastCard
- **Headspace** — color theory, soft pastels, breathing animations
- **Linear** — pure interaction polish, every micro-detail

When in doubt: **err on the side of more delight, not less.** This is not a productivity app. It's a game.

---

## 17. Final Note

The user has already endured one bad rewrite. Do not break the existing Lovable design — it's the source of truth for layout, hierarchy, and component shapes. **Add motion, add 3D, add polish — but don't redesign.** Every gradient color, every padding value, every shadow depth in the existing code was a deliberate choice. Honor it.

If you find yourself wanting to "simplify" something, stop. The user wants maximalism — every screen should feel rich, animated, and a little overwhelming on first look, then quickly become intuitive.

**Ship every screen with the polish of a $50M-funded startup. The user is paying for taste.**
