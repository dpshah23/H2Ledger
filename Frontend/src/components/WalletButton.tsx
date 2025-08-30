import React from 'react'
import { Button } from './ui/button'

interface WalletButtonProps {
  walletAddress?: string | null
  onConnect: () => void
}

export const WalletButton: React.FC<WalletButtonProps> = ({ walletAddress, onConnect }) => {
  return (
    <Button
      variant="default"
      onClick={onConnect}
      className="fixed top-4 right-4 z-50"
    >
      {walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : 'Connect Wallet'}
    </Button>
  )
}
