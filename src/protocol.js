const pull = require('pull-stream');

const { P2PNode } = require('./peer');
const { Block } = require('./block');

class Protocol {
  constructor(blockchain, peer) {
    this.blockchain = blockchain;
    this.peer = peer;
    this.peers = [];
  }

  start() {
    this.peer.on('peer:discovery', this.addPeer.bind(this));

    this.peer.handle('/sync', (protocol, conn) => {
      const strings = this.blockchain
        .getAllBlocks()
        .map(block => block.toString());
      pull(pull.values(strings), conn);
    });

    this.peer.handle('/block', (protocol, conn) => {
      pull(conn, pull.map(v => v.toString()), pull.log());
    });
  }

  addPeer(peerInfo) {
    console.log(`Peer discovered: ${peerInfo.id.toB58String()}`);

    this.peers.push(new P2PNode({ peerInfo }));
  }

  hasPeer(peer) {
    const peerIds = this.peers.map(peer => peer.id.toB58String());
    return peerIds.indexOf(peer.id.toB58String()) !== -1;
  }

  sync() {
    this.peer.dialProtocol(this.peers[0].peerInfo, '/sync', (err, conn) => {
      if (err) {
        throw err;
      }
      pull(
        conn,
        pull.map(v => Block.fromString(v.toString())),
        pull.collect(blocks => {
          for (const block in blocks) {
            this.blockchain.add(block);
          }
        })
      );
    });
  }

  addBlock(block) {
    for (const peer in this.peers) {
      this.peer.dialProtocol(peer.peerInfo, '/block', (err, conn) => {
        if (err) {
          throw err;
        }
        pull(pull.values([block.toString()]), conn);
      });
    }
  }
}

module.exports = { Protocol };
