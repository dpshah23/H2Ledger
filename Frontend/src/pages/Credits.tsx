import React, { useEffect, useState } from 'react'
import { CreditCard } from '../components/CreditCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Filter } from 'lucide-react'
import { CreditToken, creditsService } from '../services/credits'

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
  const [credits, setCredits] = useState<CreditToken[]>(mockCredits)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true)
      try {
        // Replace with actual API call when backend is ready
        // const creditsData = await creditsService.getCredits()
        // setCredits(creditsData)
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredits()
  }, [])

  const filteredCredits = credits.filter(credit =>
    credit.metadata.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.metadata.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (credit: CreditToken) => {
    console.log('View details for credit:', credit.id)
    // Navigate to detail view or open modal
  }

  const handleTransfer = (credit: CreditToken) => {
    console.log('Transfer credit:', credit.id)
    // Open transfer modal
  }

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
        <h1 className="text-3xl font-bold tracking-tight">My Credits</h1>
        <p className="text-muted-foreground">
          Manage your green hydrogen credit portfolio
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search credits by facility, token ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No credits found matching your search.</p>
        </div>
      )}
    </div>
  )
}