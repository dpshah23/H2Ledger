"""
Blockchain integration service for H2Ledger
Handles Web3 interactions with the HydrogenCredits smart contract
"""

import json
import os
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from web3 import Web3
from web3.contract import Contract
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self):
        # Initialize Web3 connection
        self.w3 = None
        self.contract = None
        self.account = None
        self.private_key = None
        
        # Configuration
        blockchain_config = getattr(settings, 'BLOCKCHAIN_SETTINGS', {})
        self.rpc_url = blockchain_config.get('NETWORK_URL', 'http://localhost:8545')
        self.contract_address = blockchain_config.get('CONTRACT_ADDRESS', None)
        self.private_key = blockchain_config.get('PRIVATE_KEY', None)
        self.gas_limit = blockchain_config.get('GAS_LIMIT', 3000000)
        self.gas_price = blockchain_config.get('GAS_PRICE', 20000000000)
        self.contract_abi = self._load_contract_abi()
        
        self._initialize_connection()

    def _load_contract_abi(self) -> List[Dict]:
        """Load contract ABI from artifacts"""
        try:
            # Look for the compiled contract in the artifacts directory
            artifacts_path = os.path.join(
                settings.BASE_DIR.parent.parent, 
                'hydrogen-credits-contracts', 
                'artifacts', 
                'contracts', 
                'HydrogenCredits.sol', 
                'HydrogenCredits.json'
            )
            
            if os.path.exists(artifacts_path):
                with open(artifacts_path, 'r') as f:
                    contract_json = json.load(f)
                    return contract_json['abi']
            else:
                logger.warning(f"Contract artifacts not found at {artifacts_path}")
                return self._get_fallback_abi()
                
        except Exception as e:
            logger.error(f"Error loading contract ABI: {e}")
            return self._get_fallback_abi()

    def _get_fallback_abi(self) -> List[Dict]:
        """Fallback ABI in case artifacts are not available"""
        return [
            {
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "mintCredits",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "amount", "type": "uint256"}],
                "name": "burnCredits",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]

    def _initialize_connection(self):
        """Initialize Web3 connection and contract instance"""
        try:
            # Connect to blockchain
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            
            if not self.w3.is_connected():
                logger.warning(f"Unable to connect to blockchain at {self.rpc_url}")
                return
            
            logger.info(f"Connected to blockchain at {self.rpc_url}")
            
            # Load account from environment variables
            private_key = os.getenv('BLOCKCHAIN_PRIVATE_KEY')
            if private_key:
                self.account = self.w3.eth.account.from_key(private_key)
                self.private_key = private_key
                logger.info(f"Loaded blockchain account: {self.account.address}")
            
            # Initialize contract if address is provided
            if self.contract_address and Web3.is_address(self.contract_address):
                self.contract = self.w3.eth.contract(
                    address=self.contract_address,
                    abi=self.contract_abi
                )
                logger.info(f"Contract initialized at {self.contract_address}")
            
        except Exception as e:
            logger.error(f"Error initializing blockchain connection: {e}")

    def is_connected(self) -> bool:
        """Check if blockchain connection is active"""
        return self.w3 is not None and self.w3.is_connected()

    def get_balance(self, address: str) -> Decimal:
        """Get credit balance for an address"""
        try:
            if not self.contract or not Web3.is_address(address):
                return Decimal('0')
            
            balance_wei = self.contract.functions.balanceOf(address).call()
            # Convert from wei to credits (assuming 18 decimals)
            balance = Decimal(balance_wei) / Decimal(10 ** 18)
            return balance
            
        except Exception as e:
            logger.error(f"Error getting balance for {address}: {e}")
            return Decimal('0')

    def mint_credits(self, to_address: str, amount: Decimal) -> Optional[str]:
        """Mint new credits to an address"""
        try:
            if not self.contract or not self.account:
                logger.error("Contract or account not initialized")
                return None
            
            if not Web3.is_address(to_address):
                logger.error(f"Invalid address: {to_address}")
                return None
            
            # Convert amount to wei (18 decimals)
            amount_wei = int(amount * Decimal(10 ** 18))
            
            # Build transaction
            function = self.contract.functions.mintCredits(to_address, amount_wei)
            transaction = function.build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Successfully minted {amount} credits to {to_address}")
                return receipt.transactionHash.hex()
            else:
                logger.error(f"Transaction failed: {receipt}")
                return None
                
        except Exception as e:
            logger.error(f"Error minting credits: {e}")
            return None

    def transfer_credits(self, from_address: str, to_address: str, amount: Decimal) -> Optional[str]:
        """Transfer credits between addresses"""
        try:
            if not self.contract:
                logger.error("Contract not initialized")
                return None
            
            if not Web3.is_address(to_address):
                logger.error(f"Invalid address: {to_address}")
                return None
            
            # Convert amount to wei
            amount_wei = int(amount * Decimal(10 ** 18))
            
            # For simplicity, using the contract owner account
            # In production, you'd need proper key management
            function = self.contract.functions.transfer(to_address, amount_wei)
            transaction = function.build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Successfully transferred {amount} credits to {to_address}")
                return receipt.transactionHash.hex()
            else:
                logger.error(f"Transfer failed: {receipt}")
                return None
                
        except Exception as e:
            logger.error(f"Error transferring credits: {e}")
            return None

    def burn_credits(self, amount: Decimal) -> Optional[str]:
        """Burn credits (offset emissions)"""
        try:
            if not self.contract or not self.account:
                logger.error("Contract or account not initialized")
                return None
            
            amount_wei = int(amount * Decimal(10 ** 18))
            
            function = self.contract.functions.burnCredits(amount_wei)
            transaction = function.build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Successfully burned {amount} credits")
                return receipt.transactionHash.hex()
            else:
                logger.error(f"Burn failed: {receipt}")
                return None
                
        except Exception as e:
            logger.error(f"Error burning credits: {e}")
            return None

    def get_total_supply(self) -> Decimal:
        """Get total supply of credits"""
        try:
            if not self.contract:
                return Decimal('0')
            
            supply_wei = self.contract.functions.totalSupply().call()
            supply = Decimal(supply_wei) / Decimal(10 ** 18)
            return supply
            
        except Exception as e:
            logger.error(f"Error getting total supply: {e}")
            return Decimal('0')

    def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        try:
            if not self.w3:
                return None
            
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return {
                'transactionHash': receipt.transactionHash.hex(),
                'blockNumber': receipt.blockNumber,
                'gasUsed': receipt.gasUsed,
                'status': receipt.status,
                'from': receipt['from'],
                'to': receipt['to']
            }
            
        except Exception as e:
            logger.error(f"Error getting transaction receipt: {e}")
            return None


# Global blockchain service instance
blockchain_service = BlockchainService()
