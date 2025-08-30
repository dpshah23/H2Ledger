// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HydrogenCredits is ERC20, Ownable {
    // --- New State Variables ---
    uint256 public marketPrice; // Market price per credit (in wei)
    uint256 public totalTraded; // Total credits traded
    uint256 public totalEmissionsOffset; // Total emissions offset (in kg or tons)
    uint256[] public marketPriceTrend; // Array to store historical market prices

    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        uint256 price; // price per credit at transaction time
    }

    mapping(address => Transaction[]) private transactionLog; // Transaction log per user
    Transaction[] private allTransactions; // All transactions

    // --- Constructor ---
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply_ * 10 ** decimals());
        marketPrice = 1 ether; // Default market price
        marketPriceTrend.push(marketPrice);
    }

    // --- Existing Functions ---
    function mintCredits(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnCredits(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function transferTokens(address to, uint256 amount) external returns (bool) {
        bool success = transfer(to, amount);
        if (success) {
            _logTransaction(msg.sender, to, amount, marketPrice);
            totalTraded += amount;
        }
        return success;
    }

    // --- New Features ---

    // 1. Total Credits Owned (already available via balanceOf)
    function totalCreditsOwned(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    // 2. Credits Traded (totalTraded)
    function creditsTraded() external view returns (uint256) {
        return totalTraded;
    }

    // 3. Market Price (settable by owner)
    function setMarketPrice(uint256 newPrice) external onlyOwner {
        marketPrice = newPrice;
        marketPriceTrend.push(newPrice);
    }

    function getMarketPrice() external view returns (uint256) {
        return marketPrice;
    }

    // 4. Emissions Offset (owner can update)
    function setEmissionsOffset(uint256 newOffset) external onlyOwner {
        totalEmissionsOffset = newOffset;
    }

    function getEmissionsOffset() external view returns (uint256) {
        return totalEmissionsOffset;
    }

    // 5. Market Price Trend (last N prices)
    function getMarketPriceTrend(uint256 n) external view returns (uint256[] memory) {
        uint256 len = marketPriceTrend.length;
        if (n > len) n = len;
        uint256[] memory trend = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            trend[i] = marketPriceTrend[len - n + i];
        }
        return trend;
    }

    // 6. Recent Transactions (last N for user)
    function recentTransactions(address account, uint256 n) external view returns (
        address[] memory froms,
        address[] memory tos,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        uint256[] memory prices
    ) {
        uint256 len = transactionLog[account].length;
        if (n > len) n = len;
        froms = new address[](n);
        tos = new address[](n);
        amounts = new uint256[](n);
        timestamps = new uint256[](n);
        prices = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            Transaction memory txn = transactionLog[account][len - n + i];
            froms[i] = txn.from;
            tos[i] = txn.to;
            amounts[i] = txn.amount;
            timestamps[i] = txn.timestamp;
            prices[i] = txn.price;
        }
        return (froms, tos, amounts, timestamps, prices);
    }

    // 7. Transaction Log (all transactions, paginated)
    function getTransactionLog(uint256 start, uint256 count) external view returns (
        address[] memory froms,
        address[] memory tos,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        uint256[] memory prices
    ) {
        uint256 len = allTransactions.length;
        if (start >= len) {
            froms = new address[](0);
            tos = new address[](0);
            amounts = new uint256[](0);
            timestamps = new uint256[](0);
            prices = new uint256[](0);
            return (froms, tos, amounts, timestamps, prices);
        }
        if (start + count > len) count = len - start;
        froms = new address[](count);
        tos = new address[](count);
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        prices = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            Transaction memory txn = allTransactions[start + i];
            froms[i] = txn.from;
            tos[i] = txn.to;
            amounts[i] = txn.amount;
            timestamps[i] = txn.timestamp;
            prices[i] = txn.price;
        }
        return (froms, tos, amounts, timestamps, prices);
    }

    // --- Internal: Log Transactions ---
    function _logTransaction(address from, address to, uint256 amount, uint256 price) internal {
        Transaction memory txn = Transaction(from, to, amount, block.timestamp, price);
        transactionLog[from].push(txn);
        transactionLog[to].push(txn);
        allTransactions.push(txn);
    }
}
