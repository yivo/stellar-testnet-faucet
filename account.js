const StellarSDK = require('stellar-sdk');
StellarSDK.Network.useTestNetwork();
const pair = StellarSDK.Keypair.random();
process.stdout.write(pair.publicKey() + ',' + pair.secret());
