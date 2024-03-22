// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmont;

    mapping(address => uint) private addressesClaimed;
    // mapping to store token amounts for each address
    mapping(address => uint256) private addressTokenAmount;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;
    event Claimed(address indexed _from, uint _dropAmount);

    constructor(
        address token_,
        bytes32 merkleRoot_,
        uint256 dropAmont_,
        address[] memory recipients,
        uint256[] memory amounts
    ) {
        require(recipients.length == amounts.length, "Lengths do not match");
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmont = dropAmont_;

        // Set token amounts for each address
        for (uint256 i = 0; i < recipients.length; i++) {
            addressTokenAmount[recipients[i]] = amounts[i];
        }
    }

    function claim(bytes32[] calldata merkleProof) external {
        require(
            addressesClaimed[msg.sender] == 0,
            "MerkleDistributor:Drop is already calimed"
        );
        // to verify merkle proof
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, node),
            "Invalid proof"
        );
        // Mark it claimed and send the token.
        addressesClaimed[msg.sender] = 1;
        uint256 amountToClaim = addressTokenAmount[msg.sender]; // Retrieve the token amount for the claimer
        require(
            amountToClaim > 0, // Ensure the claimer has a valid token amount set
            "Token amount not set for the claimer"
        );
        require(
            IERC20(token).transfer(msg.sender, amountToClaim),
            "Transfer failed"
        );
        emit Claimed(msg.sender, amountToClaim);
    }
}
