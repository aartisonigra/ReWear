import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Package, RefreshCw, Heart, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, itemsAPI } from '../services/api';

interface UserStats {
  items_listed: number;
  swaps_completed: number;
  avg_rating: number;
  total_reviews: number;
}

interface UserItem {
  id: number;
  title: string;
  category: string;
  size: string;
  condition: string;
  point_value: number;
  status: string;
  views: number;
  likes: number;
  images: Array<{ url: string; is_primary: boolean }>;
  created_at: string;
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileResponse, itemsResponse] = await Promise.all([
        userAPI.profile(),
        itemsAPI.list({ user_id: user?.id })
      ]);

      if (profileResponse.data.success) {
        const profile = profileResponse.data.profile;
        setStats({
          items_listed: profile.items_listed,
          swaps_completed: profile.swaps_completed,
          avg_rating: profile.avg_rating,
          total_reviews: profile.total_reviews
        });
        updateUser(profile);
      }

      if (itemsResponse.data.success) {
        setUserItems(itemsResponse.data.items);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">Manage your items and track your swaps</p>
          </div>
          <Link
            to="/add-item"
            className="mt-4 sm:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Item</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{user?.points || 0}</p>
                <p className="text-gray-600 text-sm">Points Balance</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.items_listed || 0}</p>
                <p className="text-gray-600 text-sm">Items Listed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.swaps_completed || 0}</p>
                <p className="text-gray-600 text-sm">Successful Swaps</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.avg_rating ? stats.avg_rating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-gray-600 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'items', label: 'My Items' },
                { id: 'swaps', label: 'Swaps' },
                { id: 'profile', label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Item listed</p>
                        <p className="text-xs text-gray-500">Your vintage jacket is now live</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Swap completed</p>
                        <p className="text-xs text-gray-500">Successfully swapped with Sarah</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">My Items</h3>
                  <Link
                    to="/add-item"
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Add New Item
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={item.images.find(img => img.is_primary)?.url || item.images[0]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{item.category}</span>
                          <span>Size {item.size}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{item.likes}</span>
                          </span>
                          <span className="text-green-600 font-medium">{item.point_value} pts</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {userItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first item to the platform</p>
                    <Link
                      to="/add-item"
                      className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                    >
                      Add Your First Item
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'swaps' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">My Swaps</h3>
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps yet</h3>
                  <p className="text-gray-600 mb-4">Start browsing items to make your first swap</p>
                  <Link
                    to="/browse"
                    className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Browse Items
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h3>
                <div className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={user?.location || ''}
                        placeholder="Enter your location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={user?.bio || ''}
                        placeholder="Tell us about yourself"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}