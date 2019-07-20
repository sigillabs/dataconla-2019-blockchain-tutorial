const commander = require('commander');

const { createPeer } = require('./peer');
const { Transaction } = require('./transaction');
const { Wallet } = require('./wallet');

async function send(options) {
  const wallet = Wallet.load();
  const transaction = new Transaction(
    wallet.getPublicKey(),
    options.destination,
    options.amount
  );

  wallet.sign(transaction);

  console.log(transaction.toString());
}

async function newWallet(options) {
  const wallet = Wallet.generate();

  console.log(wallet.getPrivateKey());
  console.log(wallet.getPublicKey());
}

async function newPeer(options) {
  await createPeer();
}

commander
  .command('send')
  .option('-d, --destination <amount>', 'Destination address')
  .option('-a, --amount <amount>', 'Amount to send')
  .action(send);

commander.command('new-wallet').action(newWallet);

commander.command('new-peer').action(newPeer);

commander.parse(process.argv);
