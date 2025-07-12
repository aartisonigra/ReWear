import React, { useState, useEffect } from 'react';
import { ArrowRight, Recycle, RefreshCw, Leaf, Eye, Heart } from 'lucide-react';
import { itemsAPI } from '../services/api';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

interface FeaturedItem {
  id: number;
  title: string;
  category: string;
  size: string;
  condition: string;
  point_value: number;
  images: Array<{ url: string; is_primary: boolean }>;
  user: { name: string };
}

export default function LandingPage({ onShowLogin, onShowRegister }: LandingPageProps) {
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedItems();
  }, []);

  const loadFeaturedItems = async () => {
    try {
      const response = await itemsAPI.list({ limit: 6, sort: 'newest' });
      if (response.data.success) {
        setFeaturedItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Sustainable Fashion{' '}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Exchange
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Trade, swap, and discover pre-loved clothing. Join the circular fashion movement 
                and reduce textile waste while refreshing your wardrobe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onShowRegister}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Start Swapping</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all duration-200"
                >
                  Browse Items
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sustainable Fashion"
                className="rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300"
              />
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Recycle className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Eco-Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How ReWear Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to start your sustainable fashion journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">List Your Items</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload photos and details of clothing you no longer wear. It's free and takes just minutes.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Swap or Redeem</h3>
              <p className="text-gray-600 leading-relaxed">
                Exchange items directly with other users or use points to redeem items you love.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Help the Planet</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce textile waste and promote sustainable fashion while discovering unique pieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section id="featured" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing pieces from our community
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.images.find(img => img.is_primary)?.url || item.images[0]?.url || 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Available
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{item.category}</span>
                      <span>Size {item.size}</span>
                      <span>{item.condition}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      Listed by {item.user.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>24</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>8</span>
                        </span>
                      </div>
                      <span className="text-green-600 font-semibold">
                        {item.point_value} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Sustainable Fashion Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users who are already making a difference
          </p>
          <button
            onClick={onShowRegister}
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            Join ReWear Today
          </button>
        </div>
      </section>
    </div>
  );
}