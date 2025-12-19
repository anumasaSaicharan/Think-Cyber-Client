import React, { useState, useEffect } from 'react';
import { FiLock, FiShoppingCart, FiStar, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * CategoryCard - Displays category with design based on plan_type
 * Plan Types:
 * - FREE: Open/unlocked, no pricing
 * - INDIVIDUAL: Topic-wise pricing
 * - BUNDLE: Single bundle price
 * - FLEXIBLE: Both bundle and individual options
 */
export const CategoryCard = ({ category, onViewDetails, onEnroll }) => {
  const getPlanTypeDesign = () => {
    switch (category.plan_type) {
      case 'FREE':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-300',
          badgeColor: 'bg-green-100 text-green-800',
          icon: '🎁',
          ribbon: 'bg-green-500 text-white'
        };
      case 'INDIVIDUAL':
        return {
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-300',
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: '📚',
          ribbon: 'bg-purple-500 text-white'
        };
      case 'BUNDLE':
        return {
          bgGradient: 'from-orange-50 to-red-50',
          borderColor: 'border-orange-300',
          badgeColor: 'bg-orange-100 text-orange-800',
          icon: '📦',
          ribbon: 'bg-orange-500 text-white'
        };
      case 'FLEXIBLE':
        return {
          bgGradient: 'from-blue-50 to-cyan-50',
          borderColor: 'border-blue-300',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: '⚡',
          ribbon: 'bg-blue-500 text-white'
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-gray-50',
          borderColor: 'border-gray-300',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: '📖',
          ribbon: 'bg-gray-500 text-white'
        };
    }
  };

  const design = getPlanTypeDesign();

  const PriceDisplay = () => {
    switch (category.plan_type) {
      case 'FREE':
        return (
          <div className="text-center py-2">
            <span className="text-lg font-bold text-green-600">Completely Free</span>
          </div>
        );
      case 'BUNDLE':
        return (
          <div className="text-center py-2">
            <span className="text-sm text-gray-600">Bundle Price</span>
            <p className="text-2xl font-bold text-orange-600">₹{category.bundle_price}</p>
            <span className="text-xs text-gray-500">All {category.topicsCount} topics</span>
          </div>
        );
      case 'INDIVIDUAL':
        return (
          <div className="text-center py-2">
            <span className="text-sm text-gray-600">Individual Pricing</span>
            <p className="text-lg font-semibold text-purple-600">Topic-wise</p>
            <span className="text-xs text-gray-500">{category.topicsCount} topics</span>
          </div>
        );
      case 'FLEXIBLE':
        return (
          <div className="text-center py-2">
            <span className="text-sm text-gray-600">Flexible Pricing</span>
            <p className="text-2xl font-bold text-blue-600">₹{category.bundle_price}</p>
            <span className="text-xs text-gray-500">Bundle or individual topics</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-gradient-to-br ${design.bgGradient} border-2 ${design.borderColor} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
      {/* Ribbon */}
      <div className={`absolute top-0 right-0 ${design.ribbon} px-4 py-1 text-xs font-bold rounded-bl-lg`}>
        {category.plan_type}
      </div>

      {/* Icon */}
      <div className="text-5xl text-center pt-4">
        {design.icon}
      </div>

      {/* Category Name */}
      <div className="px-4 py-2">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
          {category.name}
        </h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {category.description}
        </p>
      </div>

      {/* Topics Count */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between bg-white bg-opacity-50 px-2 py-1 rounded">
          <span className="text-xs text-gray-700 flex items-center gap-1">
            <FiStar size={14} />
            {category.topicsCount} Topics
          </span>
          {category.status === 'Active' && (
            <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Price Display */}
      <PriceDisplay />

      {/* Action Buttons */}
      <div className="px-4 py-3 flex gap-2 border-t border-white border-opacity-30">
        <button
          onClick={() => onViewDetails(category)}
          className="flex-1 py-2 px-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
        >
          View Topics
        </button>
        <button
          onClick={() => onEnroll(category)}
          className={`flex-1 py-2 px-3 ${design.ribbon} font-semibold rounded-lg hover:opacity-90 transition-all text-sm flex items-center justify-center gap-1`}
        >
          <FiShoppingCart size={14} />
          <span className="hidden sm:inline">Enroll</span>
        </button>
      </div>
    </div>
  );
};

/**
 * CategoriesGrid - Responsive grid displaying all categories grouped by plan type
 */
export const CategoriesGrid = ({ categories, onViewDetails, onEnroll, loading }) => {
  const groupByPlanType = () => {
    const grouped = {
      FREE: [],
      BUNDLE: [],
      INDIVIDUAL: [],
      FLEXIBLE: []
    };

    categories.forEach(cat => {
      if (grouped[cat.plan_type]) {
        grouped[cat.plan_type].push(cat);
      }
    });

    return grouped;
  };

  const grouped = groupByPlanType();

  const planTypeInfo = {
    FREE: {
      title: '🎁 Free Learning',
      description: 'Start learning completely free with no payment required',
      color: 'green'
    },
    BUNDLE: {
      title: '📦 Bundle Plans',
      description: 'Get all topics in a category at one discounted price',
      color: 'orange'
    },
    INDIVIDUAL: {
      title: '📚 Individual Topics',
      description: 'Pick and choose individual topics at your own pace',
      color: 'purple'
    },
    FLEXIBLE: {
      title: '⚡ Flexible Access',
      description: 'Buy individual topics or the entire bundle - your choice',
      color: 'blue'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([planType, cats]) => (
        cats.length > 0 && (
          <div key={planType}>
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {planTypeInfo[planType].title}
              </h2>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {planTypeInfo[planType].description}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cats.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onViewDetails={onViewDetails}
                  onEnroll={onEnroll}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No categories found</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesGrid;
