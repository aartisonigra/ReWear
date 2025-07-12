import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Heart, RefreshCw, Coins } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface Item {
  id: number;
  title: string;
  category: string;
  size: string;
  condition: string;
  point_value: number;
  allow_swaps: boolean;
  allow_points: boolean;
  views: number;
  likes: number;
  images: Array<{ url: string; is_primary: boolean }>;
  user: { name: string; location?: string };
  created_at: string;
}

export default function BrowseItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    condition: '',
    minPoints: '',
    maxPoints: '',
    allowSwaps: false,
    allowPoints: false
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadItems();
  }, [searchTerm, filters, sortBy]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        sort: sortBy,
        ...filters
      };

      const response = await itemsAPI.list(params);
      if (response.data.success) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
      showNotification('error', 'Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async (itemId: number) => {
    showNotification('info', 'Swap Request', 'Swap functionality will be implemented soon!');
  };

  const handlePointsRedeem = async (itemId: number) => {
    showNotification('info', 'Points Redemption', 'Points redemption functionality will be implemented soon!');
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      size: '',
      condition: '',
      minPoints: '',
      maxPoints: '',
      allowSwaps: false,
      allowPoints: false
    });
    setSearchTerm('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
          <p className="text-gray-600">Discover amazing pieces from our community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="points_low">Points: Low to High</option>
                <option value="points_high">Points: High to Low</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="dresses">Dresses</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Sizes</option>
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    <option value="new">New with tags</option>
                    <option value="like-new">Like new</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Points</label>
                    <input
                      type="number"
                      value={filters.minPoints}
                      onChange={(e) => setFilters({ ...filters, minPoints: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                    <input
                      type="number"
                      value={filters.maxPoints}
                      onChange={(e) => setFilters({ ...filters, maxPoints: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.allowSwaps}
                      onChange={(e) => setFilters({ ...filters, allowSwaps: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Direct Swap</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.allowPoints}
                      onChange={(e) => setFilters({ ...filters, allowPoints: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Points Redemption</span>
                  </label>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative h-64">
                    <img
                      src={item.images.find(img => img.is_primary)?.url || item.images[0]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Available
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>Size {item.size.toUpperCase()}</span>
                      <span>•</span>
                      <span>{item.condition}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Listed by {item.user.name}
                      {item.user.location && ` • ${item.user.location}`}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes}</span>
                      </span>
                      <span className="text-green-600 font-semibold">{item.point_value} pts</span>
                    </div>
                    <div className="space-y-2">
                      {item.allow_swaps && (
                        <button
                          onClick={() => handleSwapRequest(item.id)}
                          className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Request Swap</span>
                        </button>
                      )}
                      {item.allow_points && (
                        <button
                          onClick={() => handlePointsRedeem(item.id)}
                          className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Coins className="w-4 h-4" />
                          <span>Redeem for {item.point_value} pts</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}