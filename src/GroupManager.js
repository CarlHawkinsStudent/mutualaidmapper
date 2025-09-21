import React, { useState, useEffect } from 'react';

const API_BASE = window.location.origin;

function GroupManager({ token, user, onGroupChange }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupZipcode, setNewGroupZipcode] = useState('');
  const [nearbyGroups, setNearbyGroups] = useState([]);
  const [popularGroups, setPopularGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(null);
  const [nearbyPage, setNearbyPage] = useState(0);
  const [popularPage, setPopularPage] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Fetch user's groups
    fetch(`${API_BASE}/api/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setGroups);

    // Fetch groups for discovery
    fetch(`${API_BASE}/api/groups/discover`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNearbyGroups(data.nearbyGroups);
        setPopularGroups(data.popularGroups);
      });
  }, [token]);

  const handleCreate = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        name: newGroupName, 
        description: newGroupDescription,
        zipcode: newGroupZipcode 
      })
    });
    if (res.ok) {
      const group = await res.json();
      const updatedGroups = [...groups, group];
      setGroups(updatedGroups);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupZipcode('');
      setShowCreateForm(false);
      onGroupChange(updatedGroups);
      refreshDiscovery();
    } else {
      alert('Group creation failed');
    }
  };

  const handleJoin = async groupId => {
    const res = await fetch(`${API_BASE}/api/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId })
    });
    if (res.ok) {
      const group = await res.json();
      const updatedGroups = [...groups, group];
      setGroups(updatedGroups);
      onGroupChange(updatedGroups);
      setShowGroupModal(null);
      refreshDiscovery();
    } else {
      alert('Failed to join group');
    }
  };

  const handleLeave = async groupId => {
    if (!confirm('Leave this group?')) return;
    const res = await fetch(`${API_BASE}/api/groups/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId })
    });
    if (res.ok) {
      const updatedGroups = groups.filter(g => g._id !== groupId);
      setGroups(updatedGroups);
      onGroupChange(updatedGroups);
      refreshDiscovery();
    } else {
      alert('Failed to leave group');
    }
  };

  const refreshDiscovery = () => {
    fetch(`${API_BASE}/api/groups/discover`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNearbyGroups(data.nearbyGroups);
        setPopularGroups(data.popularGroups);
      });
  };



  return (
    <div className="activities-list">
      <h2>Your Groups</h2>
      <ul>
        {groups.map(g => (
          <li key={g._id}>
            {g.name}
            <button onClick={() => handleLeave(g._id)} style={{ marginLeft: '10px', background: '#dc3545' }}>Leave</button>
          </li>
        ))}
      </ul>
      
      <div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ background: '#28a745', color: 'white', marginBottom: '10px' }}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Group'}
        </button>
        
        {showCreateForm && (
          <form onSubmit={handleCreate} className="create-group-form">
            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name" required />
            <input value={newGroupZipcode} onChange={e => setNewGroupZipcode(e.target.value)} placeholder="Zipcode (optional)" pattern="[0-9]{5}" maxLength="5" />
            <textarea value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} placeholder="Description (optional)" rows="2" />
            <button type="submit">Create Group</button>
          </form>
        )}
      </div>
      
      {nearbyGroups && nearbyGroups.length > 0 && (
        <div>
          <h3>Nearby Groups</h3>
          <ul>
            {nearbyGroups.slice(nearbyPage * 5, (nearbyPage + 1) * 5).map(g => (
              <li key={g._id}>
                <button onClick={() => setShowGroupModal(g)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                  {g.name}
                </button>
                <small> ({g.members?.length || 0} members)</small>
              </li>
            ))}
          </ul>
          {nearbyGroups.length > 5 && (
            <button onClick={() => setNearbyPage(nearbyPage + 1)} disabled={nearbyPage * 5 + 5 >= nearbyGroups.length}>Next</button>
          )}
        </div>
      )}
      
      {popularGroups && popularGroups.length > 0 && (
        <div>
          <h3>Popular Groups</h3>
          <ul>
            {popularGroups.slice(popularPage * 5, (popularPage + 1) * 5).map(g => (
              <li key={g._id}>
                <button onClick={() => setShowGroupModal(g)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                  {g.name}
                </button>
                <small> ({g.members?.length || 0} members)</small>
              </li>
            ))}
          </ul>
          {popularGroups.length > 5 && (
            <button onClick={() => setPopularPage(popularPage + 1)} disabled={popularPage * 5 + 5 >= popularGroups.length}>Next</button>
          )}
        </div>
      )}
      
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => setShowGroupModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGroupModal(null)}>×</button>
            <h3>{showGroupModal.name}</h3>
            <p><strong>Members:</strong> {showGroupModal.members?.length || 0}</p>
            {showGroupModal.zipcode && <p><strong>Location:</strong> {showGroupModal.zipcode}</p>}
            {showGroupModal.description && <p><strong>Description:</strong> {showGroupModal.description}</p>}
            <button onClick={() => handleJoin(showGroupModal._id)}>Join Group</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupManager;