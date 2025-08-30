from web3 import Web3
import json
from web3.middleware import geth_poa_middleware


w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

if not w3.is_connected():
    raise Exception("❌ Could not connect to Hardhat node")

print("✅ Connected to Hardhat")

contract_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

with open("./artifacts/contracts/HydrogenCredits.sol/HydrogenCredits.json") as f:
    contract_json = json.load(f)
    abi = contract_json["abi"]

contract = w3.eth.contract(address=contract_address, abi=abi)

def mint_tokens(producer_address, verifier_address, verifier_private_key, amount):

    tx = contract.functions.mintCredits(producer_address, amount).buildTransaction({
        'from': verifier_address,
        'nonce': w3.eth.get_transaction_count(verifier_address),
        'gas': 2000000,
        'gasPrice': w3.toWei('10', 'gwei')
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=verifier_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✅ Minted {amount} tokens to {producer_address}")
    return receipt


def transfer_tokens(sender_address, sender_private_key, receiver_address, amount):
    """
    Transfer tokens between two users.
    """
    tx = contract.functions.transferTokens(receiver_address, amount).buildTransaction({
        'from': sender_address,
        'nonce': w3.eth.get_transaction_count(sender_address),
        'gas': 2000000,
        'gasPrice': w3.toWei('10', 'gwei')
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=sender_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✅ {amount} tokens transferred from {sender_address} to {receiver_address}")
    return receipt

def burn_tokens(user_address, user_private_key, amount):
    """
    Burn tokens when buyer uses them.
    """
    tx = contract.functions.burnCredits(amount).buildTransaction({
        'from': user_address,
        'nonce': w3.eth.get_transaction_count(user_address),
        'gas': 2000000,
        'gasPrice': w3.toWei('10', 'gwei')
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=user_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✅ {amount} tokens burned by {user_address}")
    return receipt

def check_balance(user_address):
    """
    Check token balance for any wallet.
    """
    balance = contract.functions.getBalance(user_address).call()
    print(f"💰 Balance for {user_address}: {balance}")
    return balance



