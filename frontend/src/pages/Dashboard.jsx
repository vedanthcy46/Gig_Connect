import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Plus } from 'lucide-react';
import GigCard from '../components/GigCard';

const Dashboard = ({ user }) => {
  const [gigs, setGigs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user.role === 'client' ? 'freelancers' : 'gigs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    radius: 25,
    category: '',
    minBudget: '',
    maxBudget: '',
    skills: []
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'gigs') {
        const response = await fetch(`/api/gigs?${new URLSearchParams(filters)}`);
        const data = await response.json();
        setGigs(data);
      } else {
        const response = await fetch(`/api/freelancers?${new URLSearchParams(filters)}`);
        const data = await response.json();
        setFreelancers(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToGig = async (gigId) => {
    try {
      const response = await fetch('/api/gig-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ gigId })
      });
      
      if (response.ok) {
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying to gig:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">GigConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('gigs')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'gigs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Browse Gigs
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'freelancers'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Find Freelancers
          </button>
          {user.role === 'client' && (
            <button
              onClick={() => setActiveTab('post-gig')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                activeTab === 'post-gig'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Gig
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5km radius</option>
                <option value="10">10km radius</option>
                <option value="25">25km radius</option>
                <option value="50">50km radius</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Creative">Creative</option>
              </select>
              
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'gigs' && gigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                onApply={handleApplyToGig}
                userRole={user.role}
              />
            ))}
            
            {activeTab === 'freelancers' && freelancers.map((freelancer) => (
              <div key={freelancer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {freelancer.first_name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{freelancer.first_name} {freelancer.last_name}</h3>
                    <p className="text-gray-600">{freelancer.title}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{freelancer.bio}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>${freelancer.hourly_rate}/hr</span>
                  <span>{freelancer.experience_years} years exp</span>
                  <span>★ {freelancer.avg_rating.toFixed(1)} ({freelancer.review_count})</span>
                </div>
                
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Freelancer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;