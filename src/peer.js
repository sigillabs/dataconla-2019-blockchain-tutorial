const defaultsDeep = require('@nodeutils/defaults-deep');
const waterfall = require('async/waterfall');
const fs = require('fs');
const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap');
const Multiplex = require('libp2p-mplex');
const TCP = require('libp2p-tcp');
const multiaddr = require('multiaddr');
const PeerInfo = require('peer-info');
const PeerId = require('peer-id');

const { BASE_PATH } = require('./constants');
const { ensureDirectory } = require('./utils');

const PEER_ID_FILE_PATH = `${BASE_PATH}/peer-id.json`;

class P2PNode extends Libp2p {
  constructor(opts) {
    const default_opts = {
      modules: {
        transport: [TCP],
        streamMuxer: [Multiplex]
      }
    };

    super(defaultsDeep(opts, default_opts));
  }
}

async function createPeer(
  opts = null,
  port = 5666,
  file_path = PEER_ID_FILE_PATH
) {
  ensureDirectory(BASE_PATH);

  if (fs.existsSync(file_path)) {
    peerIdJSON = fs.readFileSync(file_path, {
      encoding: 'utf8'
    });
    peerInfo = await PeerInfo.create(JSON.parse(peerIdJSON));
  } else {
    peerInfo = await PeerInfo.create();
    peerIdJSON = JSON.stringify(peerInfo.id.toJSON());
    fs.writeFileSync(file_path, peerIdJSON, {
      encoding: 'utf8',
      mode: 0o600
    });
  }

  const listenAddress = multiaddr(`/ip4/0.0.0.0/tcp/${port}`);
  peerInfo.multiaddrs.add(listenAddress);

  const peer = new P2PNode({ ...opts, peerInfo });

  peer.start(err => {
    if (err) {
      console.error(err);
      throw err;
    }

    const addresses = peer.peerInfo.multiaddrs.toArray();
    console.log('peer started. listening on addresses:');
    addresses.forEach(addr => console.log(addr.toString()));
  });

  return peer;
}

module.exports = { createPeer, P2PNode };
