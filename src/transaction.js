const {
  AMOUNT_SIZE,
  MAX_TRANSACTIONS,
  NULL_PUBLIC_KEY,
  NULL_SIGNATURE,
  PUBLIC_KEY_SIZE,
  SIGNATURE_SIZE,
  SIGNED_TRANSACTION_SIZE,
  TRANSACTION_SIZE
} = require('./constants');
const { ensureHexPrefix, stripHexPrefix, zeroPadLeft } = require('./utils');

class Transaction {
  static __parseString(string) {
    const source = string.substring(0, PUBLIC_KEY_SIZE);
    const destination = string.substring(PUBLIC_KEY_SIZE, 2 * PUBLIC_KEY_SIZE);
    const amount = string.substring(
      2 * PUBLIC_KEY_SIZE,
      2 * PUBLIC_KEY_SIZE + AMOUNT_SIZE
    );

    return new Transaction(source, destination, amount);
  }

  static fromString(string) {
    string = stripHexPrefix(string);

    if (string.length === TRANSACTION_SIZE) {
      return this.__parseString(string);
    } else if (string.length === SIGNED_TRANSACTION_SIZE) {
      const transaction = this.__parseString(string);
      transaction.setSignature(string.substring(TRANSACTION_SIZE));
      return transaction;
    } else {
      return null;
    }
  }

  constructor(source, destination, amount, signature = null) {
    this.source = source;
    this.destination = destination;
    this.amount = amount;
    this.signature = signature;
  }

  setSignature(signature) {
    this.signature = signature;
  }

  toString(include_signature = true) {
    const source = zeroPadLeft(this.source, PUBLIC_KEY_SIZE);
    const destination = zeroPadLeft(this.destination, PUBLIC_KEY_SIZE);
    const amount = zeroPadLeft(this.amount.toString(16), 64);
    let string =
      stripHexPrefix(source) +
      stripHexPrefix(destination) +
      stripHexPrefix(amount);

    if (include_signature) {
      const signature = zeroPadLeft(
        this.signature || NULL_SIGNATURE,
        SIGNATURE_SIZE
      );
      string += stripHexPrefix(signature);
    }

    return ensureHexPrefix(string);
  }
}

module.exports = {
  Transaction
};
