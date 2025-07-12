import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, MapPin, Calendar, RefreshCw, Coins } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface ItemDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  point_value: number;
  allow_swaps: boolean;
  allow_points: boolean;
  views: number;
  likes: number;
  tags: string[];
  images: Array<{ url: string; is_primary: boolean }>;
  user: { name: string; location?: string };
  created_at: string;
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadItem(parseInt(id));
    }
  }, [id]);

  const loadItem = async (itemId: number) => {
    try {
      const response = await itemsAPI.get(itemId);
      if (response.data.success) {
        setItem(response.data.item);
      } else {
        showNotification('error', 'Error', 'Item not found');
        navigate('/browse');
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      showNotification('error', 'Error', 'Failed to load item details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = () => {
    showNotification('info', 'Swap Request', 'Swap functionality will be implemented soon!');
  };

  const handlePointsRedeem = () => {
    showNotification('info', 'Points Redemption', 'Points redemption functionality will be implemented soon!');
  };

  const handleLike = () => {
    showNotification('info', 'Liked!', 'Like functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Browse Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.images[selectedImageIndex]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-green-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Size {item.size.toUpperCase()}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{item.condition}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{item.views} views</span>
              </span>
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{item.likes} likes</span>
              </span>
              <span className="text-green-600 font-semibold text-lg">
                {item.point_value} points
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Listed by</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {item.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.user.name}</p>
                  {item.user.location && (
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.user.location}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Listed {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLike}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>

              {item.allow_swaps && (
                <button
                  onClick={handleSwapRequest}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Request Swap</span>
                </button>
              )}

              {item.allow_points && (
                <button
                  onClick={handlePointsRedeem}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Coins className="w-5 h-5" />
                  <span>Redeem for {item.point_value} Points</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}