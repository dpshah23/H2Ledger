import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { 
  Search, 
  FileCheck, 
  AlertCircle, 
  Clock, 
  Eye,
  Download,
  Filter,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  BarChart3,
  FileX
} from 'lucide-react'
import { formatDate } from '../lib/utils'
import { toast } from 'sonner'

interface AuditTransaction {
  id: string
  tokenId: string
  issuer: string
  owner: string
  timestamp: string
  status: 'verified' | 'pending' | 'rejected'
  facilityName: string
  location: string
  quantity: number
  certificationBody: string
  co2Offset?: number
  verificationNotes?: string
}

interface AuditStats {
  totalTransactions: number
  verifiedTransactions: number
  pendingTransactions: number
  rejectedTransactions: number
  totalCredits: number
  totalCO2Offset: number
}

interface FilterState {
  status: string
  timeRange: string
  facilityType: string
  certificationBody: string
}

// Mock audit data with enhanced information
const mockAuditTransactions: AuditTransaction[] = [
  {
    id: '1',
    tokenId: 'HYD-001-2025',
    issuer: 'Nordic Wind Farm',
    owner: 'GreenTech Energy',
    timestamp: '2025-01-15T14:30:00Z',
    status: 'verified',
    facilityName: 'Nordic Wind Farm',
    location: 'Copenhagen, Denmark',
    quantity: 1000,
    certificationBody: 'GreenCert International',
    co2Offset: 850,
    verificationNotes: 'All documentation verified. Facility inspection completed.'
  },
  {
    id: '2',
    tokenId: 'HYD-002-2025',
    issuer: 'Sahara Solar Complex',
    owner: 'SolarCorp Ltd',
    timestamp: '2025-01-15T10:15:00Z',
    status: 'pending',
    facilityName: 'Sahara Solar Complex',
    location: 'Morocco',
    quantity: 750,
    certificationBody: 'International Energy Cert',
    co2Offset: 640,
    verificationNotes: 'Documentation under review. Awaiting facility inspection report.'
  },
  {
    id: '3',
    tokenId: 'HYD-003-2025',
    issuer: 'Alpine Hydro Station',
    owner: 'WindFarm Inc',
    timestamp: '2025-01-14T16:45:00Z',
    status: 'rejected',
    facilityName: 'Alpine Hydro Station',
    location: 'Swiss Alps, Switzerland',
    quantity: 500,
    certificationBody: 'EuroGreen Verify',
    co2Offset: 420,
    verificationNotes: 'Insufficient documentation. Carbon offset calculations require verification.'
  },
  {
    id: '4',
    tokenId: 'HYD-004-2025',
    issuer: 'Pacific Wind Farm',
    owner: 'Clean Energy Co',
    timestamp: '2025-01-14T09:20:00Z',
    status: 'verified',
    facilityName: 'Pacific Wind Farm',
    location: 'California, USA',
    quantity: 1200,
    certificationBody: 'US Green Energy Alliance',
    co2Offset: 1020,
    verificationNotes: 'Verified through blockchain audit trail. All requirements met.'
  },
  {
    id: '5',
    tokenId: 'HYD-005-2025',
    issuer: 'North Sea Wind',
    owner: 'EuroWind Ltd',
    timestamp: '2025-01-13T11:45:00Z',
    status: 'pending',
    facilityName: 'North Sea Wind Farm',
    location: 'North Sea, UK',
    quantity: 800,
    certificationBody: 'UK Renewable Certification',
    co2Offset: 680,
    verificationNotes: 'Third-party audit in progress. Expected completion within 5 business days.'
  }
]

export const Audit: React.FC = () => {
  const [transactions, setTransactions] = useState<AuditTransaction[]>(mockAuditTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<AuditTransaction | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    timeRange: 'all',
    facilityType: 'all',
    certificationBody: 'all'
  })

  const [stats, setStats] = useState<AuditStats>({
    totalTransactions: 0,
    verifiedTransactions: 0,
    pendingTransactions: 0,
    rejectedTransactions: 0,
    totalCredits: 0,
    totalCO2Offset: 0
  })

  const calculateStats = useCallback(() => {
    const totalTransactions = transactions.length
    const verifiedTransactions = transactions.filter(t => t.status === 'verified').length
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length
    const rejectedTransactions = transactions.filter(t => t.status === 'rejected').length
    const totalCredits = transactions.reduce((sum, t) => sum + t.quantity, 0)
    const totalCO2Offset = transactions.reduce((sum, t) => sum + (t.co2Offset || 0), 0)

    setStats({
      totalTransactions,
      verifiedTransactions,
      pendingTransactions,
      rejectedTransactions,
      totalCredits,
      totalCO2Offset
    })
  }, [transactions])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filters.status === 'all' || transaction.status === filters.status
    const matchesCertification = filters.certificationBody === 'all' || 
      transaction.certificationBody.toLowerCase().includes(filters.certificationBody.toLowerCase())

    return matchesSearch && matchesStatus && matchesCertification
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleViewDetails = (transaction: AuditTransaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsDialog(true)
  }

  const handleVerifyTransaction = async (transactionId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'verified', verificationNotes: 'Manually verified by auditor.' }
          : t
      ))
      
      toast.success('Transaction verified successfully')
    } catch (error) {
      toast.error('Failed to verify transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectTransaction = async (transactionId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'rejected', verificationNotes: 'Rejected due to insufficient documentation.' }
          : t
      ))
      
      toast.success('Transaction rejected')
    } catch (error) {
      toast.error('Failed to reject transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const exportAuditReport = () => {
    toast.success('Audit report exported successfully')
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      timeRange: 'all',
      facilityType: 'all',
      certificationBody: 'all'
    })
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Portal</h1>
          <p className="text-muted-foreground">
            Verify and monitor green hydrogen credit transactions for regulatory compliance
          </p>
        </div>
        <Button onClick={exportAuditReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All audit records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verifiedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions > 0 ? Math.round((stats.verifiedTransactions / stats.totalTransactions) * 100) : 0}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CO₂ Offset</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCO2Offset.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tons CO₂ equivalent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="filter">Advanced Filters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by token ID, issuer, owner, facility, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="filter" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="time-filter">Time Range</Label>
                  <Select value={filters.timeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="certification-filter">Certification Body</Label>
                  <Select value={filters.certificationBody} onValueChange={(value) => setFilters(prev => ({ ...prev, certificationBody: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All bodies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bodies</SelectItem>
                      <SelectItem value="greencert">GreenCert International</SelectItem>
                      <SelectItem value="international">International Energy Cert</SelectItem>
                      <SelectItem value="eurogreen">EuroGreen Verify</SelectItem>
                      <SelectItem value="us">US Green Energy Alliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Transaction Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Token ID</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Current Owner</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>CO₂ Offset</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <Badge variant={getStatusBadgeVariant(transaction.status) as any}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.tokenId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {transaction.issuer}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{transaction.facilityName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.quantity.toLocaleString()} credits</TableCell>
                  <TableCell>{transaction.co2Offset?.toLocaleString() || 0} tons</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(transaction.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {transaction.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyTransaction(transaction.id)}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectTransaction(transaction.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FileX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-muted-foreground">
                {transactions.length === 0 
                  ? "No audit records available."
                  : "No transactions match your current search and filter criteria."
                }
              </p>
              {transactions.length > 0 && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction Audit Details</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Status Alert */}
              <Alert>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className="font-medium">
                    Status: {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
                <AlertDescription className="mt-2">
                  {selectedTransaction.verificationNotes || 'No additional notes available.'}
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Token Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Token Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="font-mono">{selectedTransaction.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{selectedTransaction.quantity.toLocaleString()} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CO₂ Offset:</span>
                        <span>{selectedTransaction.co2Offset?.toLocaleString() || 0} tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Owner:</span>
                        <span>{selectedTransaction.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timestamp:</span>
                        <span>{formatDate(selectedTransaction.timestamp)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Facility Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Facility Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Facility Name:</span>
                        <span>{selectedTransaction.facilityName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{selectedTransaction.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issuer:</span>
                        <span>{selectedTransaction.issuer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certification Body:</span>
                        <span>{selectedTransaction.certificationBody}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              {selectedTransaction.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectTransaction(selectedTransaction.id)}
                    disabled={isLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <FileX className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerifyTransaction(selectedTransaction.id)}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}