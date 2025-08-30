import React, { useEffect, useState, useCallback } from 'react'
import { CreditCard } from '../components/CreditCard'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { 
  Search, 
  Wallet, 
  Award,
  Leaf,
  DollarSign
} from 'lucide-react'
import { CreditToken } from '../services/credits'
import { toast } from 'sonner'

interface AuditStats {
  totalCredits: number
  totalValue: number
  verifiedCredits: number
  co2Offset: number
}

// Mock data for demonstration
const mockCredits: CreditToken[] = [
  {
    id: '1',
    tokenId: 'HYD-001-2025',
    batchId: 'B-2025-001',
    quantity: 1000,
    origin: 'Wind Farm A',
    productionDate: '2025-01-10T00:00:00Z',
    verified: true,
    owner: 'user123',
    metadata: {
      facilityName: 'Nordic Wind Farm',
      location: 'Copenhagen, Denmark',
      certificationBody: 'GreenCert International',
      co2Offset: 850
    },
    pricePerCredit: 25.40,
    totalValue: 25400
  },
  {
    id: '2',
    tokenId: 'HYD-002-2025',
    batchId: 'B-2025-002',
    quantity: 750,
    origin: 'Solar Plant B',
    productionDate: '2025-01-08T00:00:00Z',
    verified: true,
    owner: 'user123',
    metadata: {
      facilityName: 'Sahara Solar Complex',
      location: 'Morocco',
      certificationBody: 'International Energy Cert',
      co2Offset: 640
    },
    pricePerCredit: 24.80,
    totalValue: 18600
  },
  {
    id: '3',
    tokenId: 'HYD-003-2025',
    batchId: 'B-2025-003',
    quantity: 500,
    origin: 'Hydro Plant C',
    productionDate: '2025-01-05T00:00:00Z',
    verified: false,
    owner: 'user123',
    metadata: {
      facilityName: 'Alpine Hydro Station',
      location: 'Swiss Alps, Switzerland',
      certificationBody: 'EuroGreen Verify',
      co2Offset: 420
    },
    pricePerCredit: 26.10,
    totalValue: 13050
  }
]

export const Credits: React.FC = () => {
  const [credits] = useState<CreditToken[]>(mockCredits)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<AuditStats>({
    totalCredits: 0,
    totalValue: 0,
    verifiedCredits: 0,
    co2Offset: 0
  })

  const fetchCredits = useCallback(async () => {
    try {
      // For now, use mock data. In production, uncomment the API call below:
      // const response = await creditsService.getCredits()
      // setCredits(response)
      
      // Calculate stats from mock data
      const totalCredits = credits.reduce((sum: number, credit: CreditToken) => sum + credit.quantity, 0)
      const totalValue = credits.reduce((sum: number, credit: CreditToken) => sum + credit.totalValue, 0)
      const verifiedCredits = credits.filter((credit: CreditToken) => credit.verified).length
      const co2Offset = credits.reduce((sum: number, credit: CreditToken) => sum + (credit.metadata?.co2Offset || 0), 0)
      
      setStats({ totalCredits, totalValue, verifiedCredits, co2Offset })
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      toast.error('Failed to load credits. Please try again.')
    }
  }, [credits])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const filteredCredits = credits.filter(credit => {
    const searchString = searchTerm.toLowerCase()
    return (
      credit.metadata?.facilityName?.toLowerCase().includes(searchString) ||
      credit.tokenId.toLowerCase().includes(searchString) ||
      credit.metadata?.location?.toLowerCase().includes(searchString)
    )
  })

  const handleViewDetails = (credit: CreditToken) => {
    console.log('View details for credit:', credit.id)
    toast.info(`Viewing details for ${credit.tokenId}`)
  }

  const handleTransfer = (credit: CreditToken) => {
    console.log('Transfer credit:', credit.id)
    toast.info(`Transfer initiated for ${credit.tokenId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Credits</h1>
        <p className="text-muted-foreground">
          Manage your green hydrogen credit portfolio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Carbon credits owned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total market value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Credits</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCredits}</div>
            <p className="text-xs text-muted-foreground">
              Certified and verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Offset</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.co2Offset.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tons CO₂ equivalent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search credits by facility, token ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Credits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCredits.map((credit) => (
          <CreditCard
            key={credit.id}
            credit={credit}
            onViewDetails={handleViewDetails}
            onTransfer={handleTransfer}
          />
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No credits found</p>
            <p className="text-muted-foreground text-center">
              {credits.length === 0 
                ? "You don't have any credits yet. Start by purchasing some credits."
                : "No credits match your current search criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}