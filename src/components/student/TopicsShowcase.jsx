import React, { useState, useEffect } from 'react';
import { FiLock, FiUnlock, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';

/**
 * TopicsShowcase - Display topics based on category plan_type
 * Different layouts and pricing display per plan type
 */
export const TopicsShowcase = ({ category, topics = [], onEnrollTopic, onBuyBundle }) => {
  const [expandedTopic, setExpandedTopic] = useState(null);

  const renderPlanTypeHeader = () => {
    switch (category.plan_type) {
      case 'FREE':
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-green-900 flex items-center gap-2">
              <FiUnlock className="text-green-600" />
              All Topics Are Free
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Access all {topics.length} topics completely free - no payment required!
            </p>
          </div>
        );
      case 'BUNDLE':
        return (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-orange-900 flex items-center gap-2">
              <FiDollarSign className="text-orange-600" />
              Bundle Purchase - All {topics.length} Topics
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-600">₹{category.bundle_price}</span>
              <span className="text-sm text-gray-600">
                per topic: ₹{(category.bundle_price / topics.length).toFixed(0)}
              </span>
            </div>
            <button
              onClick={() => onBuyBundle(category)}
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Buy Complete Bundle
            </button>
          </div>
        );
      case 'INDIVIDUAL':
        return (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              <FiDollarSign className="text-purple-600" />
              Individual Topic Pricing
            </h3>
            <p className="text-sm text-purple-700 mt-1">
              Each topic has individual pricing. Select and pay for what you want to learn.
            </p>
          </div>
        );
      case 'FLEXIBLE':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <FiDollarSign className="text-blue-600" />
              Choose Your Way
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Buy the complete bundle for ₹{category.bundle_price} or pick individual topics
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTopicCard = (topic, index) => {
    const isExpanded = expandedTopic === topic.id;

    let priceDisplay = null;
    let lockIcon = null;
    let actionButton = null;

    switch (category.plan_type) {
      case 'FREE':
        lockIcon = <FiUnlock className="text-green-600" />;
        actionButton = (
          <button
            onClick={() => onEnrollTopic(topic, 'free')}
            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Enroll Now
          </button>
        );
        break;

      case 'BUNDLE':
        lockIcon = <FiLock className="text-orange-600" />;
        priceDisplay = (
          <div className="mt-2 bg-orange-50 px-3 py-2 rounded">
            <span className="text-xs text-gray-600">Part of bundle</span>
            <p className="font-bold text-orange-600">Included in ₹{category.bundle_price}</p>
          </div>
        );
        actionButton = (
          <button
            onClick={() => onBuyBundle(category)}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Get Bundle
          </button>
        );
        break;

      case 'INDIVIDUAL':
        lockIcon = <FiLock className="text-purple-600" />;
        priceDisplay = (
          <div className="mt-2 bg-purple-50 px-3 py-2 rounded">
            <span className="text-xs text-gray-600">Price</span>
            <p className="text-xl font-bold text-purple-600">₹{topic.price || 'N/A'}</p>
          </div>
        );
        actionButton = (
          <button
            onClick={() => onEnrollTopic(topic, 'individual')}
            className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Buy Now
          </button>
        );
        break;

      case 'FLEXIBLE':
        lockIcon = <FiLock className="text-blue-600" />;
        priceDisplay = (
          <div className="mt-2 bg-blue-50 px-3 py-2 rounded space-y-1">
            <div>
              <span className="text-xs text-gray-600">Individual</span>
              <p className="font-bold text-blue-600">₹{topic.price || 'N/A'}</p>
            </div>
            <div className="pt-1 border-t border-blue-200">
              <span className="text-xs text-gray-600">Or get the bundle</span>
              <p className="text-sm font-semibold text-blue-600">₹{category.bundle_price}</p>
            </div>
          </div>
        );
        actionButton = (
          <div className="mt-3 space-y-2">
            <button
              onClick={() => onEnrollTopic(topic, 'individual')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              Buy Topic
            </button>
            <button
              onClick={() => onBuyBundle(category)}
              className="w-full bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              Get Bundle
            </button>
          </div>
        );
        break;
    }

    return (
      <div
        key={topic.id}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Topic Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {lockIcon}
                <h4 className="font-bold text-gray-800 text-lg">
                  {index + 1}. {topic.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {topic.description}
              </p>
            </div>
            <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
            {/* Full Description */}
            <div>
              <p className="text-sm text-gray-700">{topic.description}</p>
            </div>

            {/* Topic Stats */}
            {topic.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📺 Duration: {topic.duration}</span>
              </div>
            )}

            {topic.modules && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📚 {topic.modules} modules</span>
              </div>
            )}

            {/* Price Display */}
            {priceDisplay}

            {/* Action Button */}
            {actionButton}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600">
          {category.description}
        </p>
      </div>

      {/* Plan Type Info */}
      {renderPlanTypeHeader()}

      {/* Topics List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Topics ({topics.length})
        </h3>

        {topics.length > 0 ? (
          topics.map((topic, index) => renderTopicCard(topic, index))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No topics available in this category
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-3">Summary</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <FiCheck className="text-green-600" />
            <span>{topics.length} Topics to learn</span>
          </li>
          <li className="flex items-center gap-2">
            <FiCheck className="text-green-600" />
            <span>Lifetime access once enrolled</span>
          </li>
          <li className="flex items-center gap-2">
            <FiCheck className="text-green-600" />
            <span>Learn at your own pace</span>
          </li>
          <li className="flex items-center gap-2">
            <FiCheck className="text-green-600" />
            <span>Certificate of completion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopicsShowcase;
