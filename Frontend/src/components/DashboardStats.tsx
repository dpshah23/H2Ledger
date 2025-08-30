import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { TrendingUp, TrendingDown, Wallet, Activity, Target, Zap } from 'lucide-react'
import { formatCurrency, formatNumber } from '../lib/utils'

export interface DashboardData {
  total_credits_owned: number;
  credits_traded: {
    today: number;
    this_week: number;
  };
  market_price: {
    current: number;
    change_24h: string;
  };
  emissions_offset: {
    total: number;
    monthly_progress: number;
    target: number;
  };
  market_price_trend: Array<{
    date: string;
    price: number;
  }>;
}

interface DashboardStatsProps {
  data: DashboardData;
  loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data, loading }) => {
  const safeParseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const calculateProgress = (): number => {
    try {
      if (!data?.emissions_offset?.target) return 0;
      const progress = (data.emissions_offset.monthly_progress / data.emissions_offset.target) * 100;
      return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
    } catch {
      return 0;
    }
  };

  const progressPercentage = calculateProgress();

  if (loading || !data) {
    return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

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
          <div className="text-2xl font-bold">{formatNumber(data?.total_credits_owned ?? 0)}</div>
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
          <div className="text-2xl font-bold">{formatNumber(data?.credits_traded?.today ?? 0)}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Today</span>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(data?.credits_traded?.this_week ?? 0)} this week
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
          {safeParseNumber(data?.market_price?.change_24h ?? '0') >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data?.market_price?.current ?? 0)}</div>
          <div className="flex items-center gap-1 text-xs">
            <span className={safeParseNumber(data?.market_price?.change_24h ?? '0') >= 0 ? 'text-green-600' : 'text-red-600'}>
              {safeParseNumber(data?.market_price?.change_24h ?? '0') >= 0 ? '+' : ''}{data?.market_price?.change_24h ?? '0'}%
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
            {formatNumber(data?.emissions_offset?.total ?? 0)} kg
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Monthly Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {formatNumber(data?.emissions_offset?.monthly_progress ?? 0)} / {formatNumber(data?.emissions_offset?.target ?? 0)} kg target
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

DashboardStats.defaultProps = {
  loading: false
};