import React, { useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface ImageFile {
  file: File;
  preview: string;
}

export default function AddItem() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    size: '',
    condition_type: '',
    point_value: '',
    allow_swaps: true,
    allow_points: true,
    tags: ''
  });

  const categories = [
    { id: 1, name: 'Tops' },
    { id: 2, name: 'Bottoms' },
    { id: 3, name: 'Dresses' },
    { id: 4, name: 'Outerwear' },
    { id: 5, name: 'Shoes' },
    { id: 6, name: 'Accessories' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const conditions = [
    { value: 'new', label: 'New with tags' },
    { value: 'like-new', label: 'Like new' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      showNotification('error', 'Too many images', 'Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'File too large', 'Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateSuggestedPoints = () => {
    const basePoints: { [key: string]: number } = {
      '1': 40, // Tops
      '2': 60, // Bottoms
      '3': 80, // Dresses
      '4': 120, // Outerwear
      '5': 100, // Shoes
      '6': 50  // Accessories
    };

    const conditionMultiplier: { [key: string]: number } = {
      'new': 1.5,
      'like-new': 1.2,
      'good': 1.0,
      'fair': 0.7
    };

    const base = basePoints[formData.category_id] || 50;
    const multiplier = conditionMultiplier[formData.condition_type] || 1.0;
    
    return Math.round(base * multiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      showNotification('error', 'Images required', 'Please upload at least one image');
      return;
    }

    if (!formData.allow_swaps && !formData.allow_points) {
      showNotification('error', 'Exchange options required', 'Please select at least one exchange option');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // Add images
      images.forEach((image, index) => {
        submitData.append('images[]', image.file);
      });

      const response = await itemsAPI.create(submitData);
      
      if (response.data.success) {
        showNotification('success', 'Item Listed!', 'Your item has been submitted for review');
        navigate('/dashboard');
      } else {
        throw new Error(response.data.error || 'Failed to create item');
      }
    } catch (error: any) {
      showNotification('error', 'Upload Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPoints = formData.category_id && formData.condition_type ? calculateSuggestedPoints() : null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Item</h1>
            <p className="text-gray-600">Share your unused clothing with the ReWear community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Photos</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Click or drag images here</p>
                  <p className="text-sm text-gray-500">Upload up to 5 photos (max 5MB each)</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Vintage Denim Jacket"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Size</option>
                    {sizes.map(size => (
                      <option key={size} value={size.toLowerCase()}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    name="condition_type"
                    value={formData.condition_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the item, its condition, and any special features..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., vintage, designer, casual (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Exchange Options */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exchange Options</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allow_swaps"
                    checked={formData.allow_swaps}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow direct swaps with other items</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allow_points"
                    checked={formData.allow_points}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow redemption with points</span>
                </label>

                {formData.allow_points && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point Value
                    </label>
                    <input
                      type="number"
                      name="point_value"
                      value={formData.point_value}
                      onChange={handleInputChange}
                      min="1"
                      placeholder={suggestedPoints ? `Suggested: ${suggestedPoints}` : 'Enter point value'}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {suggestedPoints && (
                      <p className="text-sm text-gray-500 mt-1">
                        Suggested: {suggestedPoints} points based on category and condition
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Listing Item...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}