import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { TrendingUp, TrendingDown, Wallet, Activity, Target, Zap } from 'lucide-react'
import { DashboardAnalytics } from '../services/dashboard'
import { formatCurrency, formatNumber } from '../lib/utils'

interface DashboardStatsProps {
  analytics: DashboardAnalytics
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ analytics }) => {
  const progressPercentage = (analytics.emissionsOffset.thisMonth / analytics.emissionsOffset.target) * 100

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Credits Owned */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Credits Owned
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(analytics.totalCreditsOwned)}</div>
          <p className="text-xs text-muted-foreground">kWh equivalent</p>
        </CardContent>
      </Card>

      {/* Credits Traded */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Credits Traded
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(analytics.creditsTraded.today)}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Today</span>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(analytics.creditsTraded.thisWeek)} this week
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Market Price */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Market Price
          </CardTitle>
          {analytics.marketPrice.change24h >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics.marketPrice.current)}</div>
          <div className="flex items-center gap-1 text-xs">
            <span className={analytics.marketPrice.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
              {analytics.marketPrice.change24h >= 0 ? '+' : ''}{analytics.marketPrice.change24h}%
            </span>
            <span className="text-muted-foreground">24h change</span>
          </div>
        </CardContent>
      </Card>

      {/* Emissions Offset */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Emissions Offset
          </CardTitle>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-green-600" />
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(analytics.emissionsOffset.total)} kg
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Monthly Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {formatNumber(analytics.emissionsOffset.thisMonth)} / {formatNumber(analytics.emissionsOffset.target)} kg target
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}