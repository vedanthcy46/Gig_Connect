import React from 'react';
import { MapPin, Clock, DollarSign, User } from 'lucide-react';

const GigCard = ({ gig, onApply, userRole }) => {
  const formatDistance = (distance) => {
    if (!distance) return 'Remote';
    return distance < 1000 ? `${Math.round(distance)}m away` : `${(distance / 1000).toFixed(1)}km away`;
  };

  const formatBudget = (min, max, type) => {
    if (type === 'hourly') {
      return `$${min}-${max}/hr`;
    }
    return `$${min}-${max}`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {gig.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(gig.urgency)}`}>
          {gig.urgency}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {gig.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {gig.required_skills?.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
        {gig.required_skills?.length > 3 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            +{gig.required_skills.length - 3} more
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatBudget(gig.budget_min, gig.budget_max, gig.budget_type)}
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {gig.is_remote ? 'Remote' : formatDistance(gig.distance)}
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          {gig.first_name} {gig.last_name}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(gig.deadline).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Posted {new Date(gig.created_at).toLocaleDateString()}
        </span>
        
        {userRole === 'freelancer' && (
          <button
            onClick={() => onApply(gig.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default GigCard;