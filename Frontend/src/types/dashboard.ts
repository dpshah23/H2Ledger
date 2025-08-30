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
  market_price_trend: any; // Update this type based on your trend data structure
}
