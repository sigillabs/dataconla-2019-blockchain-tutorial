const {
  BLOCK_SIZE,
  MAX_TRANSACTIONS,
  NONCE_SIZE,
  NULL_PUBLIC_KEY,
  NULL_SIGNATURE,
  SIGNED_BLOCK_SIZE,
  SIGNED_TRANSACTION_SIZE,
  SIGNATURE_SIZE
} = require('./constants');
const { hash, stripHexPrefix, zeroPadLeft, zeroPadRight } = require('./utils');
const { Transaction } = require('./transaction');

class Block {
  static __parseString(string) {
    const previous = string.substring(0, HASH_SIZE);
    const nonce = string.substring(HASH_SIZE, HASH_SIZE + NONCE_SIZE);
    const transactionString = string.substring(
      HASH_SIZE + NONCE_SIZE,
      BLOCK_SIZE
    );
    const block = new Block(previous);
    block.setNonce(parseInt(nonce));
    for (let i = 0; i < MAX_TRANSACTIONS; ++i) {
      const transactionString = transactionString.substring(
        TRANSACTION_SIZE * i,
        TRANSACTION_SIZE * (i + 1)
      );
      const transaction = Transaction.fromString(transactionString);
      block.addTransaction(transaction);
    }
    return block;
  }

  static fromString(string) {
    string = stripHexPrefix(string);

    if (string.length === BLOCK_SIZE) {
      return this.__parseString(string);
    } else if (string.length === SIGNED_BLOCK_SIZE) {
      const block = this.__parseString(string);
      block.setSignature(string.substring(BLOCK_SIZE));
      return block;
    } else {
      return null;
    }
  }

  constructor(
    previous = NULL_PUBLIC_KEY,
    nonce = 0x0,
    transactions = [],
    signature = null
  ) {
    this.previous = stripHexPrefix(previous);
    this.nonce = nonce;
    this.transactions = transactions;
    this.height = signature;
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  setNonce(nonce) {
    this.nonce = nonce;
  }

  setHeight(height) {
    this.height = height;
  }

  toString(include_signature = true) {
    const nonce = zeroPadLeft(this.nonce.toString(16), NONCE_SIZE);
    const transactions = this.transactions
      .map(transaction => stripHexPrefix(transaction.toString()))
      .join('');
    const paddedTransactions = zeroPadRight(
      transactions,
      SIGNED_TRANSACTION_SIZE * MAX_TRANSACTIONS
    );
    let string =
      this.previous +
      stripHexPrefix(nonce) +
      stripHexPrefix(paddedTransactions);

    if (include_signature) {
      const signature = zeroPadLeft(
        this.signature || NULL_SIGNATURE,
        SIGNATURE_SIZE
      );
      string += stripHexPrefix(signature);
    }

    return string;
  }

  hashString() {
    return hash(this.toString(false));
  }
}

module.exports = {
  Block
};
