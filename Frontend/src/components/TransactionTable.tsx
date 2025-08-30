import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'
import { formatCurrency, formatDate, formatNumber } from "../lib/utils"

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  creditId: string;
  quantity: number;
  price: number;
  counterparty: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}


interface TransactionTableProps {
  transactions: Transaction[]
  title?: string
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions,
  title = "Recent Transactions"
}) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case 'sell':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-amber-600" />
    }
  }

  const getStatusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Credit ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="capitalize font-medium">{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{transaction.creditId}</TableCell>
                <TableCell>{formatNumber(transaction.quantity)} kWh</TableCell>
                <TableCell className="font-semibold">{formatCurrency(transaction.price)}</TableCell>
                <TableCell className="text-sm">{transaction.counterparty}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(transaction.status) as any}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}