import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MapPin, Calendar, Shield, Zap } from 'lucide-react'
import { CreditToken } from '../services/credits'
import { formatCurrency, formatNumber, formatDate } from '../lib/utils'

interface CreditCardProps {
  credit: CreditToken
  onViewDetails: (credit: CreditToken) => void
  onTransfer: (credit: CreditToken) => void
}

export const CreditCard: React.FC<CreditCardProps> = ({ 
  credit, 
  onViewDetails, 
  onTransfer 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {credit.metadata.facilityName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {credit.metadata.location}
            </div>
          </div>
          <Badge variant={credit.verified ? 'success' : 'warning'}>
            {credit.verified ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </>
            ) : (
              'Pending'
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Token ID</p>
            <p className="font-mono text-sm">{credit.tokenId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Batch ID</p>
            <p className="font-mono text-sm">{credit.batchId}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="text-lg font-semibold">{formatNumber(credit.quantity)} kWh</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold text-primary">{formatCurrency(credit.totalValue)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Produced: {formatDate(credit.productionDate)}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">
            {formatNumber(credit.metadata.co2Offset)} kg CO₂ offset
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails(credit)}
        >
          View Details
        </Button>
        <Button 
          className="flex-1"
          onClick={() => onTransfer(credit)}
        >
          Transfer
        </Button>
      </CardFooter>
    </Card>
  )
}