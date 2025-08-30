// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HydrogenCredits is ERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {   // <-- Pass msg.sender here
        _mint(msg.sender, initialSupply_ * 10 ** decimals());
    }

    function mintCredits(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnCredits(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function transferTokens(address to, uint256 amount) external returns (bool) {
        return transfer(to, amount);
    }
}
