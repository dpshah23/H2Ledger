import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Button } from '../components/ui/button'
import { Menu } from 'lucide-react'
import { WalletButton } from '../components/WalletButton'
import { useWallet } from '../utils/wallet'
import { creditsService } from '../services/credits' // ✅ import credits service

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { account, connectWallet } = useWallet()
  const [credits, setCredits] = useState<any[]>([]) // ✅ state for credits

  // Fetch credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const data = await creditsService.getCredits()
        console.log("Fetched Credits:", data) // ✅ for debugging
        setCredits(data)
      } catch (err) {
        console.error("Error fetching credits:", err)
      }
    }

    fetchCredits()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Wallet Button showing connected address */}
      <WalletButton walletAddress={account} onConnect={connectWallet} />

      <div className="flex h-[calc(100vh-4rem)]"> 
        {/* Mobile sidebar toggle */}
        <Button
          variant="default"
          size="icon"
          className="fixed top-20 left-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-0 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {/* Example: show credits count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Total Credits: {credits.length}
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
