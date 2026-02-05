import * as RNFS from '@dr.pogodin/react-native-fs';
import {fileExists} from './file';

const getMainnetConfig = (torEnabled: boolean = false) => {
  const baseConfig = `
  [Application Options]
  debuglevel=info
  maxbackoff=2s
  norest=1
  nolisten=1
  sync-freelist=1
  accept-keysend=1
  tlsdisableautofill=1

  [Routing]
  routing.assumechanvalid=1

  [Doriancoin]
  doriancoin.active=1
  doriancoin.mainnet=1
  doriancoin.node=neutrino

  [Neutrino]
  neutrino.addpeer=node0.doriancoin.com:1949
  neutrino.addpeer=node1.doriancoin.com:1949
  neutrino.addpeer=node2.doriancoin.com:1949
  neutrino.feeurl=https://blocks.doriancoin.com/api/v1/fees/recommended-lnd`;

  if (torEnabled) {
    return (
      baseConfig +
      `

  [tor]
  tor.active=1
  tor.socks=127.0.0.1:9150
  tor.streamisolation=1`
    );
  }

  return baseConfig;
};

export const createConfig = (torEnabled: boolean = false) => {
  return new Promise(async (resolve, reject) => {
    const lndConfPath = `${RNFS.DocumentDirectoryPath}/lnddsv/lnd.conf`;
    try {
      const lndDir = `${RNFS.DocumentDirectoryPath}/lnddsv`;
      const lndDirExists = await fileExists(lndDir);
      if (!lndDirExists) {
        await RNFS.mkdir(lndDir);
      }

      const config = getMainnetConfig(torEnabled);
      RNFS.writeFile(lndConfPath, config).then(() => {
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
};
