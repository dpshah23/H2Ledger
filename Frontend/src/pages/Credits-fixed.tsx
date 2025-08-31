import { useEffect, useState, useCallback } from 'react'
import { 
  Search, 
  Wallet, 
  Award,
  Leaf,
  DollarSign
} from 'lucide-react'
import { apiService } from '../services/api'

interface AuditStats {
  totalCredits: number
  totalValue: number
  verifiedCredits: number
  co2Offset: number
}

interface ApiCredit {
  id: number
  batchId: number
  amount: number
  status: 'active' | 'transferred' | 'burned'
  txHash: string
  createdAt: string
  batch: {
    producer: string
    productionDate: string
    quantityKg: number
  }
}

const Credits = () => {
  const [credits, setCredits] = useState<ApiCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<AuditStats>({
    totalCredits: 0,
    totalValue: 0,
    verifiedCredits: 0,
    co2Offset: 0
  })

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getCredits(1, 50)
      const creditData = response.data.credits || []
      setCredits(creditData)
      
      setStats({
        totalCredits: creditData.length,
        totalValue: creditData.reduce((sum: number, credit: ApiCredit) => sum + credit.amount * 50, 0),
        verifiedCredits: creditData.filter((credit: ApiCredit) => credit.status === 'active').length,
        co2Offset: creditData.reduce((sum: number, credit: ApiCredit) => sum + credit.amount * 10, 0)
      })
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setCredits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const filteredCredits = credits.filter(credit =>
    credit.batch.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.id.toString().includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
      case 'transferred': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
      case 'burned': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading credits...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Credits</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold">{stats.totalCredits}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Credits</p>
              <p className="text-2xl font-bold">{stats.verifiedCredits}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CO₂ Offset</p>
              <p className="text-2xl font-bold">{stats.co2Offset} kg</p>
            </div>
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search credits by producer, transaction hash, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Credits List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Credit Portfolio</h2>
        </div>
        <div className="p-6">
          {filteredCredits.length > 0 ? (
            <div className="space-y-4">
              {filteredCredits.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={getStatusColor(credit.status)}>
                          {credit.status}
                        </span>
                        <span className="font-medium">Credit #{credit.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{credit.amount} credits</div>
                          <div className="text-gray-600">Amount</div>
                        </div>
                        
                        <div>
                          <div className="font-medium">{credit.batch.producer}</div>
                          <div className="text-gray-600">Producer</div>
                        </div>
                        
                        <div>
                          <div className="font-medium">{new Date(credit.batch.productionDate).toLocaleDateString()}</div>
                          <div className="text-gray-600">Production Date</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        TX: {credit.txHash}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No credits found matching your search.' : 'No credits found'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Credits
