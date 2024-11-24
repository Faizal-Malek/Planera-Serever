const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    throw err;
  }
};

const comparePassword = async (password, hashed) => {
  try {
    const isValid = await bcrypt.compare(password, hashed);
    return isValid;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};