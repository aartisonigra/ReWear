import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Users, Flag, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface PendingItem {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  point_value: number;
  images: Array<{ url: string; is_primary: boolean }>;
  user: { name: string; email: string };
  created_at: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const response = await adminAPI.items('pending');
      if (response.data.success) {
        setPendingItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load pending items:', error);
      showNotification('error', 'Error', 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: number) => {
    try {
      await adminAPI.approveItem(itemId);
      showNotification('success', 'Item Approved', 'Item has been approved successfully');
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to approve item:', error);
      showNotification('error', 'Error', 'Failed to approve item');
    }
  };

  const handleReject = async (itemId: number, reason: string) => {
    try {
      await adminAPI.rejectItem(itemId, reason);
      showNotification('success', 'Item Rejected', 'Item has been rejected');
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      setShowReviewModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to reject item:', error);
      showNotification('error', 'Error', 'Failed to reject item');
    }
  };

  const openReviewModal = (item: PendingItem) => {
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage and moderate platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingItems.length}</p>
                <p className="text-gray-600 text-sm">Pending Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600 text-sm">Approved Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600 text-sm">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600 text-sm">Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending Items', count: pendingItems.length },
                { id: 'approved', label: 'Approved Items', count: 0 },
                { id: 'rejected', label: 'Rejected Items', count: 0 },
                { id: 'users', label: 'Users', count: 0 },
                { id: 'reports', label: 'Reports', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Pending Items</h3>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending items</h3>
                    <p className="text-gray-600">All items have been reviewed</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={item.images.find(img => img.is_primary)?.url || item.images[0]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>Size {item.size}</span>
                            <span>•</span>
                            <span>{item.condition}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="text-sm text-gray-500 mb-4">
                            <p>Listed by: {item.user.name}</p>
                            <p>Email: {item.user.email}</p>
                            <p>Date: {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => openReviewModal(item)}
                              className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => openReviewModal(item)}
                                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'pending' && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-xl">🚧</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">This section is under development</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Item</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={selectedItem.images.find(img => img.is_primary)?.url || selectedItem.images[0]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedItem.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedItem.images.map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={`${selectedItem.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedItem.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">{selectedItem.category}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Size {selectedItem.size}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">{selectedItem.condition}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{selectedItem.point_value} pts</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{selectedItem.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Listed by</h4>
                      <p className="text-gray-700">{selectedItem.user.name}</p>
                      <p className="text-gray-600 text-sm">{selectedItem.user.email}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={() => handleApprove(selectedItem.id)}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>Approve Item</span>
                      </button>
                      <button
                        onClick={() => handleReject(selectedItem.id, 'Item does not meet quality standards')}
                        className="w-full bg-red-600 text-white px-4 py-3 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-5 h-5" />
                        <span>Reject Item</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}