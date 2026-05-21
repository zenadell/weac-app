# Asset Shopping List

Download these and save to the matching folder. Most are free; the few paid ones have free alternatives noted.

---

## 1. Lottie Animations (free at [lottiefiles.com](https://lottiefiles.com))

Save to `assets/lottie/`. Filenames must match exactly — they're referenced in screen code.

| Filename | Search Term | Used In |
|---|---|---|
| `confetti-burst.json` | "confetti burst" | Win, level-up, quest claim |
| `confetti-money.json` | "money confetti" | Big coin reward |
| `flame.json` | "fire flame" | Streak indicator |
| `trophy-unlock.json` | "trophy reveal" | Achievement unlocked |
| `crown-spin.json` | "crown rotate" | Tournament champion |
| `radar-ping.json` | "radar scan" | Duel matchmaking |
| `loading-dots.json` | "loading three dots" | AI thinking, generic load |
| `coin-shower.json` | "coin rain" | Jackpot, big rewards |
| `heart-pulse.json` | "heart beat" | Live duel indicator |
| `paper-plane.json` | "paper plane fly" | Empty notifications |
| `sleeping-cat.json` | "cat sleeping" | Empty quests state |
| `beaker-bubble.json` | "chemistry beaker" | Pull-to-refresh |
| `checkmark-draw.json` | "checkmark animated" | Correct answer |
| `error-shake.json` | "error x shake" | Wrong answer |
| `gift-box-open.json` | "gift box opening" | Shop featured |
| `streak-aura.json` | "fire aura ring" | Around streak avatar |

**Tip:** When downloading, click the JSON download icon (not GIF/MP4). Files should be 5-50KB.

---

## 2. Rive Animations (free at [rive.app/community](https://rive.app/community))

Save to `assets/rive/`. Create a free Rive account to download `.riv` files.

| Filename | Search / Build | Used In |
|---|---|---|
| `nova-avatar.riv` | "robot avatar" or build a custom face with eye blink + breathing | Tutor screen header |
| `spin-wheel.riv` | "fortune wheel" or "lucky wheel" with spin state machine | Daily Spin screen |
| `swords-clash.riv` | "swords battle" | Duel matchmaking center |
| `level-badge.riv` | "level badge glow" | Profile avatar ring at level 10+ |
| `pulse-button.riv` | "pulse button" | Reused on primary CTAs |

If Rive Community doesn't have exactly what you need, the file format is simple enough that ChatGPT or Claude can guide you through building one in Rive's free web editor in ~10 minutes per animation.

---

## 3. 3D Models (free at [Sketchfab](https://sketchfab.com), filter by "Downloadable" + CC license)

Save to `assets/3d/`. Use `.glb` format (single binary file). Target ≤500KB each.

| Filename | Search Term | Used In |
|---|---|---|
| `trophy-gold.glb` | "trophy gold cup" | Profile / Vault trophy display |
| `atom-3d.glb` | "atom molecule" | Physics subject 3D variant |
| `dna-3d.glb` | "DNA helix" | Biology subject 3D variant |
| `brain-3d.glb` | "brain anatomy lowpoly" | Chemistry / Tutor |
| `book-stack.glb` | "books stack" | English / Literature / Papers |
| `crown-3d.glb` | "crown king" | Tournament hero |
| `coin-3d.glb` | "gold coin" | Coin balance hover |
| `gem-3d.glb` | "diamond gem" | Gems balance hover |

**Optimization:** Run downloaded `.glb` files through [gltf.report](https://gltf.report) or [glTF Transform](https://gltf-transform.dev/) to strip unused materials and compress to ≤200KB each.

---

## 4. Spline Scenes (free at [spline.design](https://spline.design))

Sign up free → use community scenes or remix. Export as **shareable URL** (no download needed — load via `react-native-webview`).

| Scene URL var | Browse | Used In |
|---|---|---|
| `SPLINE_HOME_RINGS` | Search "rings orbit" | Home hero card background |
| `SPLINE_LEVELUP` | Search "celebration burst" | LevelUpOverlay backdrop |
| `SPLINE_THRONE` | Search "throne crown" | Tournament hero |
| `SPLINE_AI_ORB` | Search "AI orb glowing" | Tutor (Nova) ambient bg |

Save URLs in `src/lib/spline-scenes.js` so they can be A/B tested.

---

## 5. Sound Effects (free at [Mixkit](https://mixkit.co/free-sound-effects/) or [Pixabay](https://pixabay.com/sound-effects/))

Save to `assets/sounds/`. Use `.mp3` 128kbps mono ≤50KB each.

| Filename | Search Term | Trigger |
|---|---|---|
| `tap.mp3` | "wood tick UI" | Every primary tap |
| `correct.mp3` | "correct positive chord" | Right answer |
| `wrong.mp3` | "incorrect dink" | Wrong answer |
| `levelup.mp3` | "level up sting" | Level-up overlay |
| `coin.mp3` | "coin pickup" | Coin gain |
| `gem.mp3` | "gem crystal" | Gem gain |
| `streak.mp3` | "whoosh fire" | Streak extended |
| `match-found.mp3` | "radar ping match" | Duel matchmaking found |
| `tick-clock.mp3` | "clock tick" | Tournament <10s countdown |
| `unlock.mp3` | "achievement unlock" | Vault card unlocked |
| `swipe.mp3` | "swoosh swipe" | Tab / page changes |

Wire through `src/lib/sounds.js`:

```js
import { Audio } from "expo-av";
const sounds = {};
export async function preload() {
  const map = { tap: require("../../assets/sounds/tap.mp3"), /* ... */ };
  for (const [k, src] of Object.entries(map)) {
    const { sound } = await Audio.Sound.createAsync(src);
    sounds[k] = sound;
  }
}
export function play(key) { sounds[key]?.replayAsync(); }
```

Respect `settings.soundsEnabled` from AsyncStorage.

---

## 6. Fonts

Already configured via `@expo-google-fonts/outfit`:

```bash
npx expo install @expo-google-fonts/outfit expo-font
```

Then in `App.js`:

```js
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
const [loaded] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
if (!loaded) return null;
```

---

## 7. Country Flags (for Register screen)

Two options:

- **Easy:** Unicode flag emojis (🇳🇬 🇬🇭 🇰🇪 🇿🇦 🇺🇬 🇹🇿 🇬🇧 🇺🇸 🇨🇦 🇮🇳 🌍). Works out of the box, no asset download.
- **Premium:** `react-native-country-flag` package — sharper SVG flags.

```bash
npm install react-native-country-flag --legacy-peer-deps
```

---

## 8. Avatar Defaults

Generate 8 default avatar styles using [DiceBear API](https://www.dicebear.com/styles/avataaars):

Save as `assets/avatars/avatar-1.png` … `avatar-8.png`. URL pattern:

```
https://api.dicebear.com/9.x/adventurer/png?seed=brainduel1&size=200
```

Vary the seed for each. Use on Profile screen and as opponent avatars in Duel.

---

## 9. Subject 3D Icons (premium — optional)

If Sketchfab options feel low-quality, [3dicons.co](https://3dicons.co) has matched-style 3D icon sets. Free tier includes 100 icons. Look for "Education" or "Science" pack.

---

## Quick checklist before handing off to Antigravity

- [ ] All Lottie JSONs downloaded to `assets/lottie/`
- [ ] All Rive `.riv` files in `assets/rive/`
- [ ] All `.glb` 3D models optimized + saved to `assets/3d/`
- [ ] Spline scene URLs saved to `src/lib/spline-scenes.js`
- [ ] All MP3 sounds in `assets/sounds/`
- [ ] DiceBear avatars in `assets/avatars/`
- [ ] `react-native-country-flag` installed (if going premium flags)
- [ ] Outfit font wired via `@expo-google-fonts/outfit`
- [ ] Run `npx expo start --lan` to verify nothing crashes on launch

If you want Claude to download these for you in advance, just say "download the Lottie/Rive/3D assets" and I'll pick reasonable defaults and curl them into the right folders.
