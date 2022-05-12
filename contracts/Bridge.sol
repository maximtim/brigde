// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Bridge is Ownable {
    using Counters for Counters.Counter;
    event SwapInitialised(uint chainIdTo, address token, address from, address to, uint amount, uint nonce);
    event RedeemCompleted(uint chainIdFrom, address token, address from, address to, uint amount, uint nonce);

    address public validator;

    constructor(address validator_) {
        validator = validator_;
    }

    Counters.Counter private nonceGenerator;

    mapping (IERC20 => bool) public supportedTokens;
    mapping (uint => bool) public supportedChainIds;
    mapping (bytes => bool) private processedTxes;

    function swap(uint chainIdTo, address token, address to, uint amount) external {
        IERC20 erc20 = IERC20(token);
        require(supportedChainIds[chainIdTo], "Blockchain is not supported");
        require(supportedTokens[erc20], "Token is not supported");

        erc20.burnFrom(msg.sender, amount);
        nonceGenerator.increment();
        emit SwapInitialised(chainIdTo, token, msg.sender, to, amount, nonceGenerator.current());
    }

    function redeem(uint chainIdFrom, address token, address from, uint amount, uint nonce, bytes memory signature) external {
        IERC20 erc20 = IERC20(token);
        require(supportedChainIds[chainIdFrom], "Blockchain is not supported");
        require(supportedTokens[erc20], "Token is not supported");
        require(processedTxes[signature] == false, "Transaction is already processed");

        bytes32 hashMsg = keccak256(abi.encodePacked(chainIdFrom, token, from, amount, nonce));
        address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(hashMsg), signature);

        require(signer == validator, "Wrong signer for signature");

        erc20.mint(msg.sender, amount);
        emit RedeemCompleted(chainIdFrom, token, from, msg.sender, amount, nonce);
    }

    function updateChainSupport(uint chainId, bool supported) external onlyOwner {
        supportedChainIds[chainId] = supported;
    }

    function updateTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[IERC20(token)] = supported;
    }
}