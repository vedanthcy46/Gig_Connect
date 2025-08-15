import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = '/api';

function App() {
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [activeTab, setActiveTab] = useState('gigs');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
      initSocket(token);
    }
    fetchGigs();
    fetchFreelancers();
  }, []);

  const initSocket = (token) => {
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const fetchGigs = async () => {
    try {
      const response = await axios.get(`${API_URL}/gigs`);
      setGigs(response.data);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setGigs([]); // Set empty array on error
    }
  };

  const fetchFreelancers = async () => {
    try {
      const response = await axios.get(`${API_URL}/freelancers`);
      setFreelancers(response.data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setFreelancers([]); // Set empty array on error
    }
  };

  const handleLogin = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      initSocket(response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRegister = async (userData) => {
    try {
      console.log('Attempting registration...', userData);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Registration response:', response.data);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      initSocket(response.data.token);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    if (socket) socket.disconnect();
  };

  const handleApplyToGig = async (gigId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/gig-applications', {
        gigId,
        coverLetter: 'I am interested in this project and would like to work with you.',
        proposedRate: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to apply: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('gigs')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'gigs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Browse Gigs
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'freelancers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Find Freelancers
          </button>
          {(user.role === 'client' || user.role === 'both') && (
            <button
              onClick={() => setActiveTab('post-gig')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'post-gig' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Post Gig
            </button>
          )}
        </div>

        {activeTab === 'gigs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map(gig => (
              <GigCard key={gig.id} gig={gig} user={user} onApply={handleApplyToGig} />
            ))}
          </div>
        )}

        {activeTab === 'freelancers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map(freelancer => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        )}

        {activeTab === 'post-gig' && (
          <PostGigForm onGigPosted={() => { setActiveTab('gigs'); fetchGigs(); }} />
        )}
      </div>
    </div>
  );
}

const Header = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">GigConnect</h1>
      <div className="flex items-center space-x-4">
        <span>Welcome, {user.firstName}!</span>
        <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Logout
        </button>
      </div>
    </div>
  </header>
);

const AuthForm = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'client'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      if (!formData.firstName || !formData.lastName) {
        alert('Please fill all required fields');
        return;
      }
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login' : 'Register'} - GigConnect
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="both">Both</option>
              </select>
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 ml-2"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const GigCard = ({ gig, user, onApply }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
    <p className="text-gray-600 mb-4">{gig.description}</p>
    <div className="mb-4">
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{gig.category}</span>
      {gig.required_skills && (() => {
        try {
          const skills = typeof gig.required_skills === 'string' ? JSON.parse(gig.required_skills) : gig.required_skills;
          return Array.isArray(skills) ? skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{skill}</span>
          )) : null;
        } catch (e) {
          return null;
        }
      })()}
    </div>
    <div className="flex justify-between items-center">
      <span className="text-green-600 font-semibold">
        ${gig.budget_min} - ${gig.budget_max}
      </span>
      <span className="text-sm text-gray-500">
        by {gig.first_name} {gig.last_name}
      </span>
    </div>
    {(user.role === 'freelancer' || user.role === 'both') && (
      <button 
        onClick={() => onApply(gig.id)}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Apply to Gig
      </button>
    )}
  </div>
);

const FreelancerCard = ({ freelancer }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-2">
      {freelancer.first_name} {freelancer.last_name}
    </h3>
    <p className="text-gray-600 mb-2">{freelancer.title}</p>
    <p className="text-gray-500 mb-4">{freelancer.bio}</p>
    <div className="flex justify-between items-center">
      <span className="text-green-600 font-semibold">
        ${freelancer.hourly_rate}/hr
      </span>
      <span className="text-sm text-gray-500">
        ⭐ {freelancer.avg_rating} ({freelancer.review_count})
      </span>
    </div>
  </div>
);

const PostGigForm = ({ onGigPosted }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Technology', 
    budgetMin: '', budgetMax: '', budgetType: 'fixed',
    isRemote: false, deadline: '', requiredSkills: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
      const token = localStorage.getItem('token');
      await axios.post('/api/gigs', {
        ...formData,
        requiredSkills: skillsArray,
        budgetMin: parseFloat(formData.budgetMin),
        budgetMax: parseFloat(formData.budgetMax)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gig posted successfully!');
      onGigPosted();
    } catch (error) {
      alert('Failed to post gig: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Post a New Gig</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Gig Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-3 border rounded-lg h-32"
          required
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full p-3 border rounded-lg"
        >
          <option value="Technology">Technology</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Min Budget"
            value={formData.budgetMin}
            onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
            className="p-3 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={formData.budgetMax}
            onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
            className="p-3 border rounded-lg"
            required
          />
        </div>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Required Skills (comma separated)"
          value={formData.requiredSkills}
          onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
          className="w-full p-3 border rounded-lg"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRemote}
            onChange={(e) => setFormData({...formData, isRemote: e.target.checked})}
            class