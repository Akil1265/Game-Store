import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { dashboardService } from '../../services/gameStoreService';
import LoadingSpinner from '../../components/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        console.log('Fetching dashboard data...');
        // Check if token exists
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setError('Please log in to view the dashboard');
          return;
        }

        console.log('Token found:', token.substring(0, 10) + '...');

        const [salesData, categoriesData, usersData] = await Promise.all([
          dashboardService.getSalesStats(),
          dashboardService.getCategoryStats(),
          dashboardService.getUserStats()
        ]);
        
        console.log('Data received:', {
          sales: salesData.data,
          categories: categoriesData.data,
          users: usersData.data
        });

        setDashboardData({
          sales: salesData.data,
          categories: categoriesData.data,
          users: usersData.data
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        console.error('Response:', err.response);
        if (err.response?.status === 401) {
          setError('Please log in with admin credentials to view this dashboard');
        } else {
          setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please log in to access the admin dashboard');
      setLoading(false);
    } else {
      fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!dashboardData) return null;

  const { sales, categories } = dashboardData;

  // Prepare sales chart data
  const salesChartData = {
    labels: sales.salesTrend.map(item => item._id),
    datasets: [
      {
        label: 'Daily Sales',
        data: sales.salesTrend.map(item => item.totalSales),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Prepare category chart data
  const categoryChartData = {
    labels: categories.map(cat => cat._id),
    datasets: [
      {
        label: 'Games per Category',
        data: categories.map(cat => cat.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Store Overview</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <h3 className="text-gray-500 text-sm">Revenue (30 days)</h3>
          <p className="text-2xl font-bold">₹{sales.summary.revenue.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-gray-500 text-sm">Orders</h3>
          <p className="text-2xl font-bold">{sales.summary.orders}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-gray-500 text-sm">New Users</h3>
          <p className="text-2xl font-bold">{sales.summary.newUsers}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-gray-500 text-sm">Total Games</h3>
          <p className="text-2xl font-bold">{sales.summary.totalGames}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          <Line data={salesChartData} options={{ 
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }} />
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Games by Category</h2>
          <Bar data={categoryChartData} options={{ 
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Games */}
        <div className="card p-6 flex flex-col">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Manage Games</h2>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading...' : `Manage ${dashboardData?.sales?.summary?.totalGames || 0} games in your store.`}
            </p>
          </div>
          <Link 
            to="/admin/games" 
            className={`btn ${error ? 'btn-disabled' : 'btn-primary'} w-full`}
            onClick={(e) => error && e.preventDefault()}
          >
            Go to Manage Games
          </Link>
        </div>

        {/* Orders */}
        <div className="card p-6 flex flex-col">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading...' : `Manage ${dashboardData?.sales?.summary?.orders || 0} customer orders.`}
            </p>
          </div>
          <Link 
            to="/admin/orders" 
            className={`btn ${error ? 'btn-disabled' : 'btn-outline'} w-full`}
            onClick={(e) => error && e.preventDefault()}
          >
            Go to Orders
          </Link>
        </div>

        {/* Users */}
        <div className="card p-6 flex flex-col">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading...' : `Manage ${dashboardData?.users?.totalUsers || 0} user accounts.`}
            </p>
          </div>
          <Link 
            to="/admin/users" 
            className={`btn ${error ? 'btn-disabled' : 'btn-outline'} w-full`}
            onClick={(e) => error && e.preventDefault()}
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* Top Selling Games */}
      <div className="mt-8 card p-4">
        <h2 className="text-lg font-semibold mb-4">Top Selling Games</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Game</th>
                <th className="px-4 py-2 text-right">Units Sold</th>
                <th className="px-4 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sales.topGames.map((game, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{game.title}</td>
                  <td className="px-4 py-2 text-right">{game.totalSold}</td>
                  <td className="px-4 py-2 text-right">₹{game.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;