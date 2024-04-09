const express = require("express");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");
const Users = require("../model/userModel.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uplodes");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
});
const router = express.Router();
router.post("/uploadAll", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { token, contractAddress } = req.body;
    const stream = fs.createReadStream(req.file.path);
    const jsonArray = await csv().fromStream(stream);
    const isValid = jsonArray.every((entry) => entry.hasOwnProperty("address"));
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Address field is missing in some entries" });
    }
    const allAddresses = jsonArray.map((entry) => entry.address);
    const allClaimAmounts = jsonArray.map((entry) => entry.claimAmount);

    await Users.create({
      contractAddress,
      token,
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
    });

    res.json({
      contractAddress,
      token,
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchData", async (req, res) => {
  try {
    const users = await Users.findOne({}, "addresses claimAmounts");
    res.json(users);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
