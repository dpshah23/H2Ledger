import { DashboardStats } from '../components/DashboardStats';
import { MarketChart } from '../components/MarketChart';
import { TransactionTable } from '../components/TransactionTable';
import { Card, CardContent } from '../components/ui/card';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
  const { data, loading, error, refetch } = useDashboardData();

  const LoadingView = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading dashboard data...</div>
    </div>
  );

  const ErrorView = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg text-red-600">
        Error: {error}
        <button 
          onClick={refetch}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const EmptyView = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">No data available</div>
    </div>
  );

  if (loading) return <LoadingView />;
  if (error) return <ErrorView />;
  if (!data) return <EmptyView />;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <DashboardStats data={data} loading={loading} />
      
      <div className="grid gap-6 mt-6">
        <Card>
          <CardContent className="pt-6">
            <MarketChart data={data.market_price_trend || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <TransactionTable 
              transactions={[]} 
              title="Recent Transactions"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;