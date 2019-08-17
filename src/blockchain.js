const { Block } = require('./block');
const {
  BLOCK_SIZE,
  MAX_TRANSACTIONS,
  NONCE_SIZE,
  NULL_PUBLIC_KEY,
  TRANSACTION_SIZE
} = require('./constants');
const { Transaction } = require('./transaction');

// TODO
const GENESIS_BLOCK = new Block();
GENESIS_BLOCK.setNonce(0x0);
GENESIS_BLOCK.setHeight(0x0);
GENESIS_BLOCK.addTransaction(
  new Transaction(NULL_PUBLIC_KEY, NULL_PUBLIC_KEY, 100000)
);
GENESIS_BLOCK.isGenesis = true;

class Blockchain {
  constructor(genesis = GENESIS_BLOCK) {
    this.blocks = {};
    this.amounts = {};
    this.tips = [];

    this.addBlock(genesis);
  }

  getTip() {
    return this.tips[0];
  }

  getBlock(hash) {
    return this.blocks[hash];
  }

  getTipBlock() {
    return this.getBlock(this.getTip());
  }

  getTipHeight() {
    return this.getTipBlock().height;
  }

  getAllBlocks() {
    const blocks = [];
    let block = this.getTipBlock();
    while (block) {
      blocks.push(block);
      block = this.getBlock(block.previous);
    }
    blocks.reverse();
    return blocks;
  }

  addBlock(block) {
    if (this.validateBlock(block)) {
      if (block.isGenesis) {
        block.setHeight(1);
      } else {
        block.setHeight(this.blocks[block.previous].height + 1);
      }

      const hash = block.hashString();

      this.blocks[hash] = block;

      for (const transaction of block.transactions) {
        this.amounts[transaction.source] -= transaction.amount;
        this.amounts[transaction.destination] += transaction.amount;
      }

      this.tips.push(hash);
      this.tips.sort(
        (tipA, tipB) => this.blocks[tipB].height - this.blocks[tipA].height
      );

      return true;
    } else {
      return false;
    }
  }

  validateBlock(block) {
    // TODO

    return true;
  }

  validateTransaction(transaction) {
    if (this.amounts[transaction.source] < transaction.amount) {
      return false;
    }

    return true;
  }
}

module.exports = {
  Blockchain
};
