// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IERC20 {
    function burnFrom(address from, uint amount) external ;
    function mint(address to, uint256 amount) external ;
}