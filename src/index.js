const Bootstrap = require('libp2p-bootstrap');

const { Blockchain } = require('./blockchain');
const { Block } = require('./block');
const { createPeer } = require('./peer');
const { Protocol } = require('./protocol');

class FixedBootstrap extends Bootstrap {
  start(cb) {
    super.start();

    cb();
  }
}

const peer_ops = {
  modules: {
    peerDiscovery: [FixedBootstrap]
  },
  config: {
    peerDiscovery: {
      autoDial: true,
      bootstrap: {
        interval: 20e3,
        // interval: 100,
        enabled: true,
        list: [
          '/ip4/127.0.0.1/tcp/5666/ipfs/QmRDeimtCkgxPDLUVDpYMiVWr6UCi3CmMix7MB3kw81KGw'
        ]
      }
    }
  }
};

async function main() {
  const blockchain = new Blockchain();
  const peer = await createPeer(peer_ops, 0);
  let protocol = new Protocol(blockchain, peer);

  peer.on('start', () => {
    protocol.start();

    setTimeout(() => protocol.sync(), 100);
  });
}

main();
