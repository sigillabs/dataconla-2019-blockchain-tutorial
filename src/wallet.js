const crypto = require('crypto');
const fs = require('fs');
const { BASE_PATH } = require('./constants');
const { ensureDirectory } = require('./utils');

const DEFAULT_PATH = `${BASE_PATH}/.wallet`;
const DEFAULT_PRIVATE_KEY_ENCODING_OPTIONS = {
  format: 'pem',
  type: 'pkcs8'
};
const DEFAULT_PUBLIC_KEY_ENCODING_OPTIONS = {
  format: 'pem',
  type: 'spki'
};

function getPrivateKeyPath(directory) {
  return `${directory}/private.pem`;
}

function getPublicKeyPath(directory) {
  return `${directory}/public.pem`;
}

class Wallet {
  static load(directory = DEFAULT_PATH) {
    ensureDirectory(directory);

    const privateKeyPath = getPrivateKeyPath(directory);
    const publicKeyPath = getPublicKeyPath(directory);

    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      const privateKeyString = fs.readFileSync(privateKeyPath, {
        encoding: 'utf8'
      });
      const publicKeyString = fs.readFileSync(publicKeyPath, {
        encoding: 'utf8'
      });
      const privateKey = crypto.createPrivateKey(privateKeyString);
      const publicKey = crypto.createPublicKey(publicKeyString);

      return new Wallet(privateKey, publicKey);
    } else {
      return null;
    }
  }

  static generate(directory = DEFAULT_PATH) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1'
    });

    const instance = new Wallet(privateKey, publicKey);

    instance.save(directory);

    return instance;
  }

  constructor(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  getPrivateKey() {
    return this.privateKey
      .export({
        type: 'pkcs8',
        format: 'der'
      })
      .toString('hex');
  }

  getPublicKey() {
    return this.publicKey
      .export({
        type: 'spki',
        format: 'der'
      })
      .toString('hex');
  }

  save(directory = DEFAULT_PATH) {
    ensureDirectory(directory);

    const privateKeyPath = getPrivateKeyPath(directory);
    const publicKeyPath = getPublicKeyPath(directory);
    const privateKeyString = this.privateKey
      .export(DEFAULT_PRIVATE_KEY_ENCODING_OPTIONS)
      .toString();
    const publicKeyString = this.publicKey
      .export(DEFAULT_PUBLIC_KEY_ENCODING_OPTIONS)
      .toString();

    fs.writeFileSync(privateKeyPath, privateKeyString, {
      encoding: 'utf8',
      mode: 0o600
    });

    fs.writeFileSync(publicKeyPath, publicKeyString, {
      encoding: 'utf8',
      mode: 0o600
    });
  }

  sign(txOrBlock) {
    txOrBlock.setSignature(null);

    const sign = crypto.createSign('SHA256');
    sign.write(txOrBlock.toString(false));
    sign.end();

    const signature = sign.sign(this.privateKey, 'hex');

    txOrBlock.setSignature(signature);

    return txOrBlock;
  }
}

module.exports = { Wallet };
