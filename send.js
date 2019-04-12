// Create, sign, and submit a transaction using JS Stellar SDK.

// Assumes that you have the following items:
// 1. Secret key of a funded account to be the source account
// 2. Public key of an existing account as a recipient
//    These two keys can be created and funded by the friendbot at
//    https://www.stellar.org/laboratory/ under the heading "Quick Start: Test Account"
// 3. Access to JS Stellar SDK (https://github.com/stellar/js-stellar-sdk)
//    either through Node.js or in the browser.

// This code can be run in the browser at https://www.stellar.org/laboratory/
// That site exposes a global StellarSDK object you can use.
// To run this code in the Chrome, open the console tab in the DevTools.
// The hotkey to open the DevTools console is Ctrl+Shift+J or (Cmd+Opt+J on Mac).
const StellarSDK = require('stellar-sdk');

// The source account is the account we will be signing and sending from.
const sourceSecretKey = process.argv[2];

// Derive Keypair object and public key (that starts with a G) from the secret
const sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

const receiverPublicKey = process.argv[3];

// Configure StellarSDK to talk to the horizon instance hosted by Stellar.org
// To use the live network, set the hostname to 'horizon.stellar.org'
const server = new StellarSDK.Server('https://horizon-testnet.stellar.org');

// Uncomment the following line to build transactions for the live network. Be
// sure to also change the horizon hostname.
// StellarSDK.Network.usePublicNetwork();
StellarSDK.Network.useTestNetwork();

(async function main() {
  // Transactions require a valid sequence number that is specific to this account.
  // We can fetch the current sequence number for the source account from Horizon.
  const account = await server.loadAccount(sourcePublicKey);


  // Right now, there's one function that fetches the base fee.
  // In the future, we'll have functions that are smarter about suggesting fees,
  // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
  const fee = await server.fetchBaseFee();


  let transaction = new StellarSDK.TransactionBuilder(account, { fee })
    // Add a payment operation to the transaction
    .addOperation(StellarSDK.Operation.payment({
      destination: receiverPublicKey,
      // The term native asset refers to lumens
      asset: StellarSDK.Asset.native(),
      // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
      // the decimal. They are represented in JS Stellar SDK in string format
      // to avoid errors from the use of the JavaScript Number data structure.
      amount: process.argv[4],
    }))
    // Make this transaction valid for the next 30 seconds only
    .setTimeout(30);

  if (process.argv[5]) { transaction = transaction.addMemo(StellarSDK.Memo.text(process.argv[5])) }

  transaction = transaction.build();

  // Sign this transaction with the secret key
  // NOTE: signing is transaction is network specific. Test network transactions
  // won't work in the public network. To switch networks, use the Network object
  // as explained above (look for StellarSDK.Network).
  transaction.sign(sourceKeypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  console.log(transaction.toEnvelope().toXDR('base64'));

  // Submit the transaction to the Horizon server. The Horizon server will then
  // submit the transaction into the network for us.
  try {
    const transactionResult = await server.submitTransaction(transaction);
    console.log(JSON.stringify(transactionResult, null, 2));
    console.log('\nSuccess! View the transaction at: ');
    console.log(transactionResult._links.transaction.href);
  } catch (e) {
    console.log('An error has occured:');
    console.log(e);
  }
})();
