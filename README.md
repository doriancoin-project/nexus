# Doriancoin Mobile Wallet

Pay, trade & grow with Doriancoin. Doriancoin Mobile Wallet gives you low-fee sends and private payments — all in one tap.

### Dev Instructions

Building Doriancoin Mobile Wallet is simple. If your system is already configured for native mobile development, or for React Native development, building can be done in a few simple steps.

**Required Tools:**
- Node v22+ (via nvm)
- Yarn
- Xcode
- Android Studio
- Cocoapods for iOS

**Installation Instructions:**
```bash
$ git clone https://github.com/doriancoin-project/doriancoin-mobile-wallet.git
$ cd doriancoin-mobile-wallet
$ yarn

# ios specific
$ yarn run fetch:ios # fetches ios lnddsv framework
$ yarn run pods

# android specific
$ yarn run fetch:android # fetches android lnddsv framework

$ yarn start
```

You should now be able to open up the project in Android Studio or Xcode and compile a binary.

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) if you are interested in contributing code to the Doriancoin Mobile Wallet codebase. More information about debugging is documented in CONTRIBUTING.md.
