# Nostos

A React Native mobile application for [brief description of what Nostos does].

## Features

- User authentication (Login/Signup)
- Home feed
- Photo exploration
- Photo viewing
- User profiles

## Prerequisites

- Node.js (v14 or newer)
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nostos-globe/NostosApp/
cd NostosApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (macOS only):

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Development
1. Start Metro bundler
```bash
npm start
# or
yarn start
```
2. Run on Android
```bash
npm run android
# or
yarn android
```
3. Run on iOS (macOS only)
```bash
npm run ios
# or
yarn ios
```
4. Environment Setup
Android
Set the ANDROID_HOME environment variable:
```bash
setx ANDROID_HOME "C:\Users\[YourUsername]\AppData\Local\Android\Sdk"
```

iOS
Ensure Xcode and CocoaPods are correctly installed and set up.

Testing
Run the test suite:

```bash
npm test
# or
yarn test
```

Project Structure
```bash
NostosApp/
├── src/
│   ├── config/      # Configuration files
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── Other Screens...
│   ├── services/    # API and business logic
│   └── utils/       # Utility functions

```