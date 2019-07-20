const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function ensureDirectory(directory) {
  const parts = directory.split(path.sep);

  for (let i = 2; i < parts.length + 1; ++i) {
    const dir = parts.slice(0, i).join(path.sep);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
}

function zeroPadRight(hex, strlen) {
  let padded_hex = stripHexPrefix(hex);
  let amount = strlen - padded_hex.length;
  while (amount-- > 0) {
    padded_hex += '0';
  }
  return padded_hex;
}

function zeroPadLeft(hex, strlen) {
  let padded_hex = stripHexPrefix(hex);
  let amount = strlen - padded_hex.length;
  while (amount-- > 0) {
    padded_hex = '0' + padded_hex;
  }
  return padded_hex;
}

function stripHexPrefix(hex) {
  if (hex.substring(0, 2) == '0x') {
    return hex.substring(2);
  } else {
    return hex;
  }
}

function ensureHexPrefix(hex) {
  if (hex.substring(0, 2) !== '0x') {
    return '0x' + hex;
  } else {
    return hex;
  }
}

function hash(message) {
  return crypto
    .createHash('sha256')
    .update(message)
    .digest('hex');
}

module.exports = {
  ensureDirectory,
  zeroPadLeft,
  zeroPadRight,
  stripHexPrefix,
  ensureHexPrefix,
  hash
};
