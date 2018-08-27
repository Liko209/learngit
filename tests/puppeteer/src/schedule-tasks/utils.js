function getMB(bytes) {
  return Number((bytes / 1024 / 1024).toFixed(2));
}

module.exports = { getMB };
