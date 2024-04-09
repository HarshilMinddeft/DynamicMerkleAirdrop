const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  contractAddress: {
    type: [String],
    required: true,
  },
  token: {
    type: [String],
    required: true,
  },
  addresses: {
    type: [String],
    required: true,
  },
  claimAmounts: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("Users", userSchema);
