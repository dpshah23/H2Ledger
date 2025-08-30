import React, { useEffect, useState } from 'react'
import { DashboardStats } from '../components/DashboardStats'
import { MarketChart } from '../components/MarketChart'
import { TransactionTable } from '../components/TransactionTable'
import { DashboardAnalytics, Transaction, dashboardService } from '../services/dashboard'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'


// Mock data for demonstration
const mockAnalytics: DashboardAnalytics = {
  totalCreditsOwned: 15420,
  creditsTraded: {
    today: 850,
    thisWeek: 3240
  },
  marketPrice: {
    current: 25.40,
    change24h: 2.3,
    trend: [
      { date: '2025-01-01', price: 24.80 },
      { date: '2025-01-02', price: 25.10 },
      { date: '2025-01-03', price: 24.95 },
      { date: '2025-01-04', price: 25.30 },
      { date: '2025-01-05', price: 25.40 },
    ]
  },
  emissionsOffset: {
    total: 125000,
    thisMonth: 8500,
    target: 12000
  }
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    creditId: 'HYD-001-2025',
    quantity: 500,
    price: 12750,
    counterparty: 'GreenTech Energy',
    timestamp: '2025-01-15T14:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'sell',
    creditId: 'HYD-002-2025',
    quantity: 250,
    price: 6350,
    counterparty: 'SolarCorp Ltd',
    timestamp: '2025-01-15T10:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'transfer',
    creditId: 'HYD-003-2025',
    quantity: 100,
    price: 2540,
    counterparty: 'WindFarm Inc',
    timestamp: '2025-01-14T16:45:00Z',
    status: 'pending'
  },
]

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(mockAnalytics)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Replace with actual API calls when backend is ready
        // const [analyticsData, transactionsData] = await Promise.all([
        //   dashboardService.getAnalytics(),
        //   dashboardService.getTransactions(10)
        // ])
        // setAnalytics(analyticsData)
        // setTransactions(transactionsData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your green hydrogen credits portfolio and trading activity
        </p>
      </div>

      {/* Analytics Overview */}
      <DashboardStats analytics={analytics} />

      {/* Market Chart and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarketChart analytics={analytics} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full">Buy Credits</Button>
                <Button variant="outline" className="w-full">List for Sale</Button>
                <Button variant="ghost" className="w-full">View Portfolio</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <TransactionTable transactions={transactions} />
    </div>
  )
}