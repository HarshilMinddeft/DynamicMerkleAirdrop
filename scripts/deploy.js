const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber } = require("ethers");
const fs = require("fs").promises;

async function main() {
  [signer1, signer2] = await ethers.getSigners();

  const customAddress = "0x4e25aec97De40E34F503bf123fCad04Afe02046f";
  signer2 = { address: customAddress };

  // signer3 ={address :"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}

  walletAddresses = [signer1, signer2].map((s) => s.address);

  leaves = walletAddresses.map((x) => KECCAK256(x));
  tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });
  PuffCoin = await ethers.getContractFactory("PuffCoin", signer1);
  token = await PuffCoin.deploy();
  MerkleDistributor = await ethers.getContractFactory(
    "MerkleDistributor",
    signer1
  );

  distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot(),
    BigNumber.from("6000000000000000000")
  );

  await token
    .connect(signer1)
    .mint(distributor.address, BigNumber.from("90000000000000000000"));

  console.log("PuffCoin:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("signer1:", signer1.address);
  console.log("Addresses", walletAddresses);
  const merkleRoot = tree.getHexRoot();

  // Print the 32-byte Merkle root
  console.log("32-byte Merkle root:", merkleRoot);
  //This will put all address in json file for frontend
  const indexedAddresses = {};
  walletAddresses.map((x, idx) => (indexedAddresses[idx] = x));
  const serializedAddresses = JSON.stringify(indexedAddresses);
  await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
