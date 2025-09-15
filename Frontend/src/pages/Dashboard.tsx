import { DashboardStats } from '../components/DashboardStats';
import { MarketChart } from '../components/MarketChart';
import { TransactionTable } from '../components/TransactionTable';
import TradingPanel from '../components/TradingPanel';
import { Card, CardContent } from '../components/ui/card';
import { useDashboardData } from '../hooks/useDashboardData';
import { dashboardService, Transaction } from '../services/dashboard';
import { useState, useEffect } from 'react';

// 🟢 Import Chatbot + Toggle
import Chatbot from "../components/chatbot/chatbot";
import ChatToggle from '../components/chatbot/ChatToggle';

const Dashboard = () => {   
  const { data, loading, error, refetch } = useDashboardData();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // 🟢 Chatbot toggle state
  const [showChat, setShowChat] = useState(false);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const fetchedTransactions = await dashboardService.getTransactions(10);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
    <div className="container mx-auto py-8 px-4 relative">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'trading'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Trading
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
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
                  transactions={transactions} 
                  title="Recent Transactions"
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'trading' && (
        <TradingPanel />
      )}

      {/* 🟢 Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChat && <Chatbot />}  {/* Chatbot is now fully connected via apiService */}
        <ChatToggle onClick={() => setShowChat(!showChat)} isOpen={showChat} />
      </div>
    </div>
  );
};

export default Dashboard;
