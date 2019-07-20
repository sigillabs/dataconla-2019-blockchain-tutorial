const { Blockchain } = require('./blockchain');
const { Block } = require('./block');
const { BASE_PATH } = require('./constants');
const { createPeer } = require('./peer');
const { Protocol } = require('./protocol');

async function main() {
  const blockchain = new Blockchain();
  const peer = await createPeer(
    null,
    5666,
   `${BASE_PATH}/peer-id-bootstrap.json`
  );
  let protocol = new Protocol(blockchain, peer);

  peer.on('start', () => {
    protocol.start();

    const blockA = new Block(blockchain.getTip());
    const blockB = new Block(blockA.hashString());

    blockchain.addBlock(blockA);
    blockchain.addBlock(blockB);
  });
}

main();
