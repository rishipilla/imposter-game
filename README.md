# Imposter Word Game

A pass-and-play party game where most players receive the same secret word while one player—the **Imposter**—receives a different but related word. Players give clues, discuss, and vote to find the Imposter.

> **Project status:** In development. This README describes the planned MVP; features may not be implemented yet.

## 🎮 How to Play

1. Add at least three players.
2. The game selects a secret word pair and randomly chooses one Imposter.
3. Each player takes a turn viewing their word privately on the shared phone.
4. After everyone has viewed their word, the app randomly chooses who starts.
5. Players take turns describing their words without saying the words themselves.
6. Everyone votes for the player they suspect is the Imposter.
7. Reveal the result and play another round.

Regular players receive the same word. The Imposter receives a related but different word.

## ✨ Planned Features

- Create a game and add, edit, or remove player names.
- Easy, Medium, and Hard word difficulties.
- Curated word pairs from categories such as food, animals, places, objects, professions, technology, and abstract concepts.
- Private word reveal and hide-before-pass flow for one shared phone.
- Random Imposter and starting-player selection.
- Voting, vote tally, tie handling, and results.
- Local history to reduce repeated word pairs.
- Offline-first gameplay with no account required for the MVP.

## 🧰 Planned Technology Stack

- **Flutter** — cross-platform mobile UI
- **Dart** — application logic
- **SQLite** — local game and word-history storage
- **Android Studio** — Android SDK, emulator, and build tools
- **Visual Studio Code** — coding and debugging

The initial version is planned as an offline Android app. A backend or online multiplayer mode is not required for the MVP.

## 🚀 Development Setup

### Prerequisites

1. Install the Flutter SDK using the [official Windows guide](https://docs.flutter.dev/install).
2. Add the Flutter SDK's `bin` directory to your Windows `Path`.
3. Install [Android Studio](https://developer.android.com/studio) and the Android SDK, Platform-Tools, and an emulator.
4. Install [Visual Studio Code](https://code.visualstudio.com/) and its Flutter extension.

Verify your setup in a new VS Code terminal:

```powershell
flutter --version
dart --version
flutter doctor
```

Resolve the required items reported by `flutter doctor` before building for Android.

### Create or run the project

If you are starting from an empty repository and want to create the Flutter project in this directory, first ensure the directory does not contain files you need to preserve. From its parent directory, run:

```powershell
flutter create imposter_game
cd imposter_game
flutter run
```

If the Flutter project already exists, open its project root (the folder containing `pubspec.yaml`) in VS Code and run:

```powershell
flutter pub get
flutter devices
flutter run
```

## 🗺️ Planned Game Flow

```text
Home
  └── Create Game
      └── Add Players
          └── Choose Difficulty
              └── Select Word Pair
                  └── Assign Secret Words
                      └── Private Reveal for Each Player
                          └── Random Starting Player
                              └── Clue Discussion
                                  └── Voting
                                      └── Reveal Result
                                          └── Play Again / Home
```

## 🗃️ Planned Data Model

The local database is expected to include:

- **players** — reusable player names and IDs.
- **word_pairs** — normal word, Imposter word, category, difficulty, and active status.
- **rounds** — selected word pair, Imposter, starting player, and round status.
- **round_players** — players participating in each round and their word assignments.
- **votes** — voter, selected suspect, and round.
- **settings** — default difficulty and game preferences.

Database details may change as implementation and testing progress.

## 🔒 Privacy Notes

The app is designed for one shared device. The UI should hide each secret word before the phone passes to the next player and should not expose assignments on ordinary gameplay screens. Local SQLite data is not automatically encrypted, so this is intended to prevent casual viewing rather than forensic access to the device.

## 🧪 Testing Checklist

- Validate player count and player names.
- Confirm exactly one Imposter in the MVP.
- Confirm all regular players receive the same word and the Imposter receives the paired word.
- Ensure words stay hidden between turns.
- Prevent duplicate votes and handle ties.
- Avoid recent word-pair repetition when possible.
- Verify completed rounds and word history persist after restarting the app.
- Confirm core gameplay works offline.

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome. Open an issue to discuss a change before starting a large implementation.

## 📄 License

No license has been specified yet. Until a license is added, assume the repository's contents are not granted for reuse, redistribution, or modification beyond rights provided by applicable law.

---

**Built for friends, bluffing, and figuring out who's the Imposter.**
