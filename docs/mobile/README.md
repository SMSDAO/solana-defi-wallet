# Mobile App Documentation

The Solana DeFi Wallet mobile app is built with React Native and provides native mobile experiences for iOS and Android.

## Overview

The mobile app shares the core business logic with the web app while providing platform-specific UI components and native features.

## Features

- 🔐 Secure wallet management
- 💱 Token swapping
- 📊 Portfolio tracking
- 🔔 Push notifications
- 📱 Biometric authentication
- 🌐 Offline mode support
- 📲 Deep linking

---

## Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment
- Xcode (for iOS)
- Android Studio (for Android)

### iOS Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Install iOS pods
cd ios
pod install
cd ..

# Run on iOS
npm run ios
```

### Android Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

---

## Project Structure

```
mobile/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── components/      # React Native components
│   ├── screens/         # App screens
│   ├── navigation/      # Navigation setup
│   ├── hooks/           # Custom hooks
│   ├── services/        # Business logic
│   ├── utils/           # Utilities
│   └── store/           # State management
├── app.json             # App configuration
├── package.json         # Dependencies
└── README.md            # This file
```

---

## Screens

### 1. Home Screen
- Wallet balance
- Quick actions (Send, Receive, Swap)
- Recent transactions
- Market overview

### 2. Swap Screen
- Token selection
- Amount input
- Slippage settings
- Transaction preview
- Swap execution

### 3. Portfolio Screen
- Token holdings
- Value charts
- Performance metrics
- Asset allocation

### 4. Tokens Screen
- Token list
- Search functionality
- Favorites
- Token details

### 5. Settings Screen
- Wallet management
- Security settings
- Network selection
- App preferences

---

## Navigation

Using React Navigation v6:

```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Swap" component={SwapScreen} />
        <Tab.Screen name="Portfolio" component={PortfolioScreen} />
        <Tab.Screen name="Tokens" component={TokensScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## State Management

Using Zustand for state management:

```typescript
// store/wallet.ts
import create from 'zustand';

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set) => ({
  connected: false,
  publicKey: null,
  balance: 0,
  connect: async () => {
    // Connect wallet logic
  },
  disconnect: () => {
    set({ connected: false, publicKey: null, balance: 0 });
  },
}));
```

---

## Native Features

### Biometric Authentication

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your wallet',
    });
    return result.success;
  }
  
  return false;
}
```

### Push Notifications

```typescript
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    const token = await Notifications.getExpoPushTokenAsync();
    // Send token to backend
    return token.data;
  }
  
  return null;
}
```

### Secure Storage

```typescript
import * as SecureStore from 'expo-secure-store';

async function saveSecure(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getSecure(key: string) {
  return await SecureStore.getItemAsync(key);
}
```

---

## API Integration

Shared API client with web app:

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const swapService = {
  getQuote: async (params) => {
    const { data } = await api.post('/swap/standard', params);
    return data;
  },
};
```

---

## Building for Production

### iOS Production Build

```bash
# Using EAS Build
eas build --platform ios

# Or using Xcode
# 1. Open ios/YourApp.xcworkspace in Xcode
# 2. Select "Any iOS Device" as target
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

### Android Production Build

```bash
# Using EAS Build
eas build --platform android

# Or manual build
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

---

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests (Detox)

```bash
# Build app for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

---

## Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com/api
EXPO_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_APP_ENV=production
```

---

## Distribution

### iOS App Store

1. **Prepare app**
   - App icons and screenshots
   - App Store description
   - Privacy policy

2. **Submit for review**
   - TestFlight beta testing
   - App Store review
   - Release

### Google Play Store

1. **Prepare app**
   - Feature graphic
   - Screenshots
   - Description

2. **Release**
   - Internal testing
   - Closed beta
   - Production release

---

## Performance Optimization

### Image Optimization

```typescript
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

// Use FastImage for better performance
<FastImage
  source={{ uri: tokenLogo, priority: FastImage.priority.normal }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.contain}
/>
```

### List Optimization

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={tokens}
  renderItem={renderToken}
  keyExtractor={(item) => item.address}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## Debugging

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper

```bash
# iOS
npm run ios

# Android
npm run android

# Flipper will auto-connect
```

---

## Common Issues

### Metro bundler issues

```bash
# Clear cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean
cd ios && xcodebuild clean
```

### Native module issues

```bash
# iOS
cd ios && pod install

# Android
cd android && ./gradlew clean
```

---

## Roadmap

- [ ] Wallet Connect integration
- [ ] NFT support
- [ ] Advanced charting
- [ ] Social features
- [ ] Widget support
- [ ] Watch-only wallets

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Solana Mobile Stack](https://docs.solanamobile.com/)

---

**Status**: In Development  
**Last Updated**: 2025-01-20  
**Platform Support**: iOS 14+, Android 8+
