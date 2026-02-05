export const DORIANCOIN = {
  messagePrefix: '\x19Doriancoin Signed Message:\n',
  bech32: 'dsv',
  bip32: {
    public: 0x0488b21e, // xpub
    private: 0x0488ade4, // xprv
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x05,
  wif: 0xb0,
};

export const DORIANCOIN_WITH_ZPRV = {
  messagePrefix: '\x19Doriancoin Signed Message:\n',
  bech32: 'dsv',
  bip32: {
    public: 0x04b24746, // zpub
    private: 0x04b2430c, // zprv
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x05,
  wif: 0xb0,
};
