import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TrendingUp, TrendingDown, Activity, Plus } from 'lucide-react'
import { apiService } from '../services/api'

interface TradingOrder {
  id: number
  user_name: string
  order_type: 'buy' | 'sell'
  quantity: number
  price_per_credit: number
  filled_quantity: number
  status: 'pending' | 'partial' | 'completed' | 'cancelled'
  created_at: string
}

interface MarketData {
  current_price: number
  volume_24h: number
  change_24h: number
  trend: Array<{ date: string; price: number }>
}

export const TradingPanel: React.FC = () => {
  const [orders, setOrders] = useState<TradingOrder[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({
    order_type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price_per_credit: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersResponse, marketResponse] = await Promise.all([
        apiService.getTradingOrders(),
        apiService.getMarketData()
      ])
      
      setOrders(ordersResponse.data.orders || [])
      setMarketData(marketResponse.data)
    } catch (error) {
      console.error('Error fetching trading data:', error)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await apiService.createTradingOrder({
        order_type: orderForm.order_type,
        quantity: parseFloat(orderForm.quantity),
        price_per_credit: parseFloat(orderForm.price_per_credit)
      })
      
      setOrderForm({ order_type: 'buy', quantity: '', price_per_credit: '' })
      setShowOrderForm(false)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  ${marketData.current_price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Current Price</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {marketData.volume_24h.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">24h Volume</div>
              </div>
              <div>
                <div className={`text-2xl font-bold flex items-center gap-1 ${
                  marketData.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.change_24h >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {marketData.change_24h >= 0 ? '+' : ''}{marketData.change_24h.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">24h Change</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading market data...</div>
          )}
        </CardContent>
      </Card>

      {/* Trading Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Trading Orders</CardTitle>
          <Button 
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </CardHeader>
        <CardContent>
          {showOrderForm && (
            <form onSubmit={handleCreateOrder} className="mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={orderForm.order_type}
                    onChange={(e) => setOrderForm({...orderForm, order_type: e.target.value as 'buy' | 'sell'})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Amount of credits"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Credit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.price_per_credit}
                    onChange={(e) => setOrderForm({...orderForm, price_per_credit: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Price in USD"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {order.order_type.toUpperCase()} {order.quantity} credits @ ${order.price_per_credit}
                      </div>
                      <div className="text-sm text-gray-600">
                        Filled: {order.filled_quantity} / {order.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No trading orders found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TradingPanel
