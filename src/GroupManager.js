import React, { useState, useEffect } from 'react';
import Chat from './Chat';

const API_BASE = window.location.origin;

function GroupManager({ token, user, onGroupChange }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    // Fetch user's groups
    fetch(`${API_BASE}/api/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setGroups);

    // Fetch all groups for joining
    fetch(`${API_BASE}/api/groups/all`)
      .then(res => res.json())
      .then(setAllGroups);
  }, [token]);

  const handleCreate = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newGroupName })
    });
    if (res.ok) {
      const group = await res.json();
      const updatedGroups = [...groups, group];
      setGroups(updatedGroups);
      setNewGroupName('');
      onGroupChange(updatedGroups);
      // Refresh all groups list
      fetch(`${API_BASE}/api/groups/all`)
        .then(res => res.json())
        .then(setAllGroups);
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
    } else {
      alert('Failed to join group');
    }
  };

  const filteredGroups = allGroups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !groups.some(ug => ug._id === g._id)
  );

  return (
    <div className="activities-list">
      <h2>Your Groups</h2>
      <ul>
        {groups.map(g => (
          <li key={g._id}>
            {g.name} 
            <button onClick={() => setSelectedGroup(g)} style={{ marginLeft: '10px' }}>Chat</button>
          </li>
        ))}
      </ul>
      
      <form onSubmit={handleCreate}>
        <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="New group name" required />
        <button type="submit">Create Group</button>
      </form>
      
      <h3>Join Groups</h3>
      <input 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
        placeholder="Search groups..." 
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <ul>
        {filteredGroups.map(g => (
          <li key={g._id}>
            {g.name} <button onClick={() => handleJoin(g._id)}>Join</button>
          </li>
        ))}
      </ul>
      
      {selectedGroup && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setSelectedGroup(null)} style={{ marginBottom: '10px' }}>Close Chat</button>
          <Chat token={token} user={user} groupId={selectedGroup._id} groupName={selectedGroup.name} />
        </div>
      )}
    </div>
  );
}

export default GroupManager;