// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.2;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor {
    using SafeERC20 for IERC20;
    address public immutable token;
    bytes32 public immutable merkleRoot;
    mapping(address => uint256) private addressesClaimed;
    event Claimed(address indexed _from, uint256 _dropAmount);
    constructor(address token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }
    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(
            addressesClaimed[account] == 0,
            "MerkleDistributor: Drop already claimed"
        );

        // Concatenate and encode leaf data
        bytes32 leafData = keccak256(abi.encodePacked(account, amount));

        // Verify the Merkle proof
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafData),
            "Invalid proof"
        );
        addressesClaimed[account] = 1;
        require(IERC20(token).transfer(account, amount), "Transfer failed");
        emit Claimed(account, amount);
    }
    function transferTokens(uint256 amount) external {
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= amount,
            "MerkleDistributor: Insufficient allowance"
        );
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
}
