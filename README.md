# React Native Background Location Pro (free evaluation)

**Production-grade background location tracking for React Native that survives app kills, reboots, and offline periods, with no third-party tracking SDKs.**

Try the complete native pipeline free in your own app, on your own routes. When you are ready to ship, a one-time license gets you the full source.

> **Featured in a Google AI Overview comparison of React Native New Architecture background location SDKs (Nov 2026)**
>
> *"Best for mission-critical apps requiring bulletproof recovery from process death."*

<p align="center">
  <img src="https://background-location-pro.vercel.app/img/ai-overview.png" alt="Google AI Overview comparison table of New Architecture background location packages" width="420" />
  <img src="https://background-location-pro.vercel.app/img/ai-overview_2.png" alt="Google AI Overview explanation of react-native-background-location-pro" width="420" />
</p>

<details>
<summary>What Google's AI Overview says</summary>

> Built to address the "JS background trap". Most older libraries boot the React Native JavaScript runtime in the background to handle location updates; under memory pressure the OS kills the JS thread and tracking stops silently. This package acts as a native-only engine: native tracking, offline batch buffering in an isolated SQLite instance, and sync retries run entirely on the native side, without relying on the JS thread staying alive. A free version (react-native-background-location-pro-eval) is available on npm to test crash recovery in debug mode.

</details>

[![npm](https://img.shields.io/npm/v/react-native-background-location-pro-eval?style=flat&logo=npm&color=cb3837&label=eval)](https://www.npmjs.com/package/react-native-background-location-pro-eval)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=white)
![New Architecture](https://img.shields.io/badge/New%20Architecture-TurboModules-61DAFB?logo=react&logoColor=white)
![JSI](https://img.shields.io/badge/JSI-direct%20native%20calls-blueviolet)
![Kotlin](https://img.shields.io/badge/Android-Kotlin-7F52FF?logo=kotlin&logoColor=white)
![Swift](https://img.shields.io/badge/iOS-Swift-FA7343?logo=swift&logoColor=white)
![Android](https://img.shields.io/badge/Android-shipping-3DDC84?logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-shipping-000000?logo=apple&logoColor=white)

---

## 👋 From the creator of react-native-pdf-jsi

I'm Punith Manthri, the author of [**react-native-pdf-jsi**](https://www.npmjs.com/package/react-native-pdf-jsi), the open-source JSI-accelerated PDF viewer for React Native. It has crossed **390k+ downloads on npm** and is used in production apps around the world.

[![npm version](https://img.shields.io/npm/v/react-native-pdf-jsi?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/react-native-pdf-jsi)
[![total downloads](https://img.shields.io/npm/d18m/react-native-pdf-jsi?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/react-native-pdf-jsi)
[![weekly downloads](https://img.shields.io/npm/dw/react-native-pdf-jsi?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/react-native-pdf-jsi)
[![GitHub stars](https://img.shields.io/github/stars/126punith/react-native-pdf-jsi?style=for-the-badge&logo=github&color=181717)](https://github.com/126punith/react-native-pdf-jsi)

Background Location Pro is built with the same focus: native performance, New Architecture first, and code you can trust in production.

---

## 🎬 Demo

Both platforms use the same JS API and the same ingestion server, so the live map looks identical.

<table>
<tr>
<td width="50%" align="center">

**Android**: Kotlin foreground service

<a href="https://github.com/126punith/react-native-background-location-pro/blob/main/assets/demo.mp4">
  <img src="https://raw.githubusercontent.com/126punith/react-native-background-location-pro/main/assets/demo-preview.gif" alt="Android background location tracking demo" width="320" />
</a>

[Watch the Android demo (MP4)](https://github.com/126punith/react-native-background-location-pro/blob/main/assets/demo.mp4)

</td>
<td width="50%" align="center">

**iOS**: Swift `CLLocationManager`

<a href="https://github.com/126punith/react-native-background-location-pro/blob/main/assets/demo-ios.mp4">
  <img src="https://raw.githubusercontent.com/126punith/react-native-background-location-pro/main/assets/demo-ios-preview.gif" alt="iOS background location tracking demo" width="320" />
</a>

[Watch the iOS demo (MP4)](https://github.com/126punith/react-native-background-location-pro/blob/main/assets/demo-ios.mp4)

</td>
</tr>
</table>

In the demo, tracking starts in the foreground, then the app is backgrounded and its process is killed by the system. Points keep landing on the live map, and the offline queue drains on reconnect.

---

## ✅ Try it free

The evaluation build runs the full native pipeline:

- **The complete iOS pipeline**: `CLLocationManager` capture with displacement and teleport filtering, SQLite buffering with idempotent batch sync, a CoreMotion low-power gate, and a watchdog built on significant-change relaunch and `BGAppRefreshTask`.
- **Three tracking profiles** (`continuous_fitness`, `adaptive_low_power`, `balanced`), switchable live with one line of JS.
- **Zero app wiring**: no `AppDelegate` edits and no module registration.

It runs fully in your development builds. Production and store builds report `buildTier: 'release'` and tracking stays off until you [license the source](#-get-access).

## Install

```sh
npm i react-native-background-location-pro-eval
cd ios && pod install
```

## Use

```ts
import LocationTracker from 'react-native-background-location-pro-eval';

LocationTracker.startTracking('http://localhost:3000');
const status = LocationTracker.getStatus();
```

Your app needs the `Info.plist` keys `UIBackgroundModes`, `BGTaskSchedulerPermittedIdentifiers`, and the location and motion usage strings. The paid editions ship a complete setup guide, a backend ingestion server, and a live map.

📖 **Full documentation:** [background-location-pro.vercel.app](https://background-location-pro.vercel.app) covers installation, Android and iOS setup, the API reference, offline sync, platform limitations and troubleshooting. To run it locally: `cd website && npm install && npm start`.


### How this package works (developer view)

- Your app calls the typed TurboModule API (`startTracking`, `stopTracking`, `getStatus`, sync/profile methods).
- Native Android/iOS layers keep collecting in background, persist points on-device first, then sync to your backend.
- JS listeners (`onLocationUpdate`, `onSyncStatus`) reflect live state, but core tracking and retries continue natively even if JS is paused.

---

## 💎 What you get with a license

Every edition includes:

- **Full native source code**, yours to modify, with no third-party tracking SDKs
- The React Native JS API (typed TurboModule spec) and a ready-to-use live dashboard screen
- Three tracking profiles with the native motion gate
- **Bulletproof native sync**: classified retries, `Retry-After`, jitter, a dead-letter queue, and retry state that survives process death
- **Store approval blueprint** for your platform: manifest, `Info.plist` and privacy-manifest templates, disclosure text and reviewer notes
- A backend ingestion server with a real-time live map, and fault injection for testing retries
- A setup and run guide
- **Lifetime updates** to the repositories you bought

| Edition | Native code | Private repository access |
| --- | --- | --- |
| **Android Edition** | Complete Android tracking module (Kotlin, New Architecture) | Android repository |
| **iOS Edition** | Complete iOS tracking module (Swift + Objective-C++ TurboModule) | iOS repository |
| **Best Value Edition** | Both modules | Both repositories |

Want the tested scenarios and the comparison with other tracking libraries? See the [full product page](https://github.com/126punith/react-native-background-location-pro#readme).

---

## 🚀 Get access

Pay once, no subscription. Pick an edition, then the payment option that matches your location.

| Edition | What you get | USD (GitHub Sponsors) | INR (UPI) |
| --- | --- | --- | --- |
| **Android Edition** | Android module + JS API + server | **$39** | **₹3,000** |
| **iOS Edition** | iOS module + JS API + server | **$59** | **₹5,000** |
| **Best Value Edition** ⭐ | Android + iOS, both repositories | **$89** (save $9) | **₹7,000** (save ₹1,000) |

### 🌎 Option A: International developers (outside India), via GitHub Sponsors

Pay securely through GitHub Sponsors with any credit card, debit card, or PayPal.

👉 **[Sponsor on GitHub (one-time)](https://github.com/sponsors/126punith)**

> **Important:** choose the **One-time** tab and select the tier for your edition: **$39** (Android), **$59** (iOS), or **$89** (Best Value). Do **not** pick a monthly sponsorship. This is a single payment, not a subscription.

**How access works**

1. Open the link above, switch to **One-time**, and complete the sponsorship for your edition.
2. I personally confirm that your sponsorship and payment have come through.
3. I then add your GitHub account as a collaborator to the repository (or both repositories for Best Value) that matches your tier, usually within 24 hours.
4. Accept the invite from your email or from [github.com/notifications](https://github.com/notifications).

*No need to send your username, because GitHub shows me which account sponsored and which tier. If you sponsored from a different account than the one you want access on, email [punithm300@gmail.com](mailto:punithm300@gmail.com).*

### 🇮🇳 Option B: Indian developers (UPI / GPay)

Pay directly via UPI: **₹3,000** (Android), **₹5,000** (iOS), or **₹7,000** (Best Value).

1. Scan the QR code below with any UPI app (GPay, PhonePe, Paytm).
2. Enter the amount for your edition and make a one-time payment.
3. Email a screenshot of the successful payment, the **edition** you bought, and your **GitHub username** to **[punithm300@gmail.com](mailto:punithm300@gmail.com)**.
4. You'll be added as a collaborator to the matching private repository (or both for Best Value) after the payment is verified.

<p align="center">
  <img src="https://raw.githubusercontent.com/126punith/react-native-background-location-pro/main/assets/upi-qr.jpeg" alt="GPay / UPI QR code" width="260" />
</p>

---

## FAQ

**Is this a subscription?**
No. Every edition is a one-time payment with lifetime access to its repository and updates. On GitHub Sponsors, make sure you pick the one-time tier ($39, $59, or $89), not a monthly one.

**Which edition should I buy?**
Buy the Android or iOS Edition if your app ships on one platform. If you ship on both, the Best Value Edition costs less than buying the two separately.

**Can I use it in commercial apps?**
Yes, with a license. You can use the source in personal and commercial projects.

**I paid but haven't got access yet.**
Email [punithm300@gmail.com](mailto:punithm300@gmail.com) with your GitHub username, the edition you bought, and a Sponsors receipt or UPI screenshot.

---

## License

This evaluation build is covered by the [evaluation license](LICENSE). The paid editions are covered by the commercial source license on the [product page](https://github.com/126punith/react-native-background-location-pro#license).

---

## Topics

`react-native` · `background-location` · `location-tracking` · `geolocation` · `gps-tracking` · `background-tracking` · `background-service` · `background-tasks` · `turbomodule` · `new-architecture` · `jsi` · `react-native-module` · `ios` · `android` · `swift` · `kotlin` · `offline-first` · `fleet-tracking` · `mobile-development` · `npm-package`

