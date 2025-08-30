import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Search, FileCheck, AlertCircle, Clock, Eye } from 'lucide-react'
import { VERIFICATION_STATUS } from '../utils/constants'
import { formatDate } from '../lib/utils'

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
}

// Mock audit data
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
    certificationBody: 'GreenCert International'
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
    certificationBody: 'International Energy Cert'
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
    certificationBody: 'EuroGreen Verify'
  },
]

export const Audit: React.FC = () => {
  const [transactions, setTransactions] = useState<AuditTransaction[]>(mockAuditTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<AuditTransaction | null>(null)

  const filteredTransactions = transactions.filter(transaction =>
    transaction.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.facilityName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return <FileCheck className="h-4 w-4 text-green-600" />
      case VERIFICATION_STATUS.PENDING:
        return <Clock className="h-4 w-4 text-amber-600" />
      case VERIFICATION_STATUS.REJECTED:
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return 'success'
      case VERIFICATION_STATUS.PENDING:
        return 'warning'
      case VERIFICATION_STATUS.REJECTED:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Portal</h1>
        <p className="text-muted-foreground">
          Verify and monitor green hydrogen credit transactions for regulatory compliance
        </p>
      </div>

      {/* Search and Overview */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by token ID, issuer, owner, or facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified</span>
              <Badge variant="success">
                {transactions.filter(t => t.status === 'verified').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="warning">
                {transactions.filter(t => t.status === 'pending').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rejected</span>
              <Badge variant="destructive">
                {transactions.filter(t => t.status === 'rejected').length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Log</CardTitle>
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
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <Badge variant={getStatusVariant(transaction.status) as any}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.tokenId}</TableCell>
                  <TableCell>{transaction.issuer}</TableCell>
                  <TableCell>{transaction.owner}</TableCell>
                  <TableCell className="text-sm">{transaction.facilityName}</TableCell>
                  <TableCell>{transaction.quantity} kWh</TableCell>
                  <TableCell className="text-sm">{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Token Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token ID:</span>
                  <span className="font-mono">{selectedTransaction.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{selectedTransaction.quantity} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility:</span>
                  <span>{selectedTransaction.facilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{selectedTransaction.location}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Verification</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(selectedTransaction.status) as any}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certification Body:</span>
                  <span>{selectedTransaction.certificationBody}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span>{formatDate(selectedTransaction.timestamp)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}