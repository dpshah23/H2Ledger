// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HydrogenCredits
 * @dev ERC20 token representing green hydrogen credits.
 * Features:
 * 1. Verifier mints tokens to producer wallets after verifying certificate.
 * 2. Producer can transfer/sell tokens to buyers.
 * 3. Buyer can burn tokens when used.
 * 4. Display balance for any wallet.
 */
contract HydrogenCredits is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("HydrogenCredits", "HGC")
        Ownable(initialOwner)  // pass initial owner explicitly
    {}

    // Mapping of approved verifiers
    mapping(address => bool) public verifiers;

    // Events for audit/logging
    event VerifierAdded(address verifier);
    event VerifierRemoved(address verifier);
    event CreditsMinted(address verifier, address producer, uint256 amount);
    event CreditsBurned(address user, uint256 amount);
    event TokensTransferred(address from, address to, uint256 amount);

    // Constructor


    // Modifier: only verifiers
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not a verifier");
        _;
    }

    // Admin adds a verifier
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    // Admin removes a verifier
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    // Mint tokens to producer wallet after verification
    function mintCredits(address _producer, uint256 _amount) external onlyVerifier {
        require(_producer != address(0), "Invalid producer wallet");
        _mint(_producer, _amount);
        emit CreditsMinted(msg.sender, _producer, _amount);
    }

    // Burn tokens from sender (buyer using tokens)
    function burnCredits(uint256 _amount) external {
        _burn(msg.sender, _amount);
        emit CreditsBurned(msg.sender, _amount);
    }

    // Transfer tokens from sender to another wallet (buy/sell)
    function transferTokens(address _to, uint256 _amount) external returns (bool) {
        _transfer(msg.sender, _to, _amount);
        emit TokensTransferred(msg.sender, _to, _amount);
        return true;
    }

    // Helper: get balance of any wallet
    function getBalance(address _wallet) external view returns (uint256) {
        return balanceOf(_wallet);
    }
}
