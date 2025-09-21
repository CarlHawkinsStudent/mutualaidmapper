import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import ActivityForm from './ActivityForm';
import ActivitiesList from './ActivitiesList';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GroupManager from './GroupManager';
import ChatPage from './ChatPage';
import ProfileModal from './ProfileModal';
import AdminPanel from './AdminPanel';


const API_BASE = window.location.origin;
const API_URL = `${API_BASE}/api/activities`;

function App() {
  const [activities, setActivities] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);


  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((error) => console.error("Error fetching activities:", error));
  }, []);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.email) {
        setUser(userData);
        // Fetch user groups when user is set
        fetch(`${API_BASE}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(groups => {
            console.log('Fetched user groups:', groups);
            setUserGroups(groups);
          })
          .catch(err => console.error('Error fetching groups:', err));
      }
    }
  }, [token]);

  const handleActivitySubmit = async (newActivity) => {
    try {
      console.log('Sending to API:', API_URL, newActivity);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivity),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const savedActivity = await response.json();
      setActivities([savedActivity, ...activities]);
      return savedActivity;
    } catch (error) {
      console.error("Error submitting activity:", error);
      throw new Error(error.message || 'Failed to submit activity');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthMenu(false);
    setShowMainMenu(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setUserGroups([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleClearSession = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setUserGroups([]);
    setShowMainMenu(false);
    window.location.reload();
  };

  const handleRegister = () => {
    setShowRegister(false);
    setShowAuthMenu(false);
    setShowMainMenu(false);
  };

  const handleGroupChange = (groups) => {
    console.log('Groups changed:', groups);
    setUserGroups(groups);
  };

  // Debug logging
  console.log('Current state:', { user: !!user, userGroups: userGroups.length, token: !!token });



  return (
    <div className="App">
      <header className="App-header">
        <h1>Mutual Aid Activity Mapper</h1>
        <div className="menu-container">
          <button className="menu-toggle" onClick={() => setShowMainMenu(!showMainMenu)}>
            ☰ Menu
          </button>
          {showMainMenu && (
            <div className="main-menu">
              <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={handleClearSession} style={{ background: '#dc3545' }}>Clear Session</button>
              
              {user ? (
                <>
                  <span>Welcome, {user.username}!</span>
                  <button onClick={() => { setShowProfile(true); setShowMainMenu(false); }}>Profile</button>
                  {user.isAdmin && (
                    <button onClick={() => { setShowAdmin(true); setShowMainMenu(false); }}>Admin</button>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuthMenu(!showAuthMenu)}>
                    {showAuthMenu ? 'Close' : 'Login / Register'}
                  </button>
                  {showAuthMenu && (
                    <div className="auth-menu">
                      {showRegister ? (
                        <div>
                          <RegisterForm onRegister={handleRegister} />
                          <button onClick={() => setShowRegister(false)}>Switch to Login</button>
                        </div>
                      ) : (
                        <div>
                          <LoginForm onLogin={handleLogin} />
                          <button onClick={() => setShowRegister(true)}>Switch to Register</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </header>
      <main>
        {user && (
          <>
            <GroupManager token={token} user={user} onGroupChange={handleGroupChange} />
            {userGroups.length > 0 && (
              <ActivityForm onActivitySubmit={handleActivitySubmit} groups={userGroups} user={user} />
            )}
          </>
        )}
        <ActivitiesList activities={activities} />
      </main>

      <div className="map-container">
        <h2>Activity Map</h2>
        <MapComponent activities={activities} darkMode={darkMode} />
      </div>

      {user && userGroups.length > 0 && (
        <div className="chat-container">
          <h2>Group Chat</h2>
          <ChatPage token={token} user={user} />
        </div>
      )}
      
      {showProfile && user && (
        <ProfileModal 
          userId={user.id} 
          token={token} 
          onClose={() => setShowProfile(false)}
          isOwnProfile={true}
        />
      )}
      
      {showAdmin && user?.isAdmin && (
        <AdminPanel 
          token={token} 
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}

export default App;