import React, { useState, useEffect } from 'react';

const API_BASE = window.location.origin;

function AdminPanel({ token, onClose }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchUsers = () => {
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error('Error fetching users:', err));
  };

  const fetchMessages = () => {
    fetch(`${API_BASE}/api/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setMessages)
      .catch(err => console.error('Error fetching messages:', err));
  };

  const deleteUser = (userId) => {
    if (!confirm('Delete this user?')) return;
    fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchUsers())
      .catch(err => alert('Error deleting user'));
  };

  const deleteMessage = (messageId) => {
    if (!confirm('Delete this message?')) return;
    fetch(`${API_BASE}/api/admin/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchMessages())
      .catch(err => alert('Error deleting message'));
  };

  const saveUser = (user) => {
    fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(user)
    })
      .then(() => {
        fetchUsers();
        setEditingUser(null);
      })
      .catch(err => alert('Error updating user'));
  };

  const toggleAdmin = (user) => {
    const action = user.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to';
    const confirmMessage = `Are you sure you want to ${action} ${user.username}?`;
    
    if (!confirm(confirmMessage)) return;
    
    const updatedUser = { ...user, isAdmin: !user.isAdmin };
    
    fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(updatedUser)
    })
      .then(() => {
        fetchUsers();
        alert(`Successfully ${user.isAdmin ? 'removed admin privileges from' : 'granted admin privileges to'} ${user.username}`);
      })
      .catch(err => alert('Error updating admin status'));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Admin Panel</h2>
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button 
            className={activeTab === 'messages' ? 'active' : ''} 
            onClick={() => setActiveTab('messages')}
          >
            Messages ({messages.length})
          </button>
          <button 
            className={activeTab === 'system' ? 'active' : ''} 
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="admin-content">
            <h3>User Management</h3>
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  {editingUser?.id === user.id ? (
                    <UserEditForm 
                      user={editingUser} 
                      onChange={setEditingUser}
                      onSave={() => saveUser(editingUser)}
                      onCancel={() => setEditingUser(null)}
                    />
                  ) : (
                    <div>
                      <div className="user-header">
                        <strong>{user.username}</strong> 
                        {user.isAdmin && <span className="admin-badge">ADMIN</span>}
                      </div>
                      <small>{user.email} | {user.zipcode} | {user.pronouns}</small>
                      <br />
                      <small>{user.bio}</small>
                      <div className="user-actions">
                        <button onClick={() => setEditingUser(user)}>Edit</button>
                        <button 
                          onClick={() => toggleAdmin(user)}
                          className={`admin-toggle-btn ${user.isAdmin ? 'remove-admin' : 'make-admin'}`}
                        >
                          {user.isAdmin ? '🔒 Remove Admin' : '🔑 Make Admin'}
                        </button>
                        <button onClick={() => deleteUser(user.id)} style={{ background: '#dc3545', color: 'white' }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-content">
            <h3>Message Management</h3>
            <div className="message-list">
              {messages.map(msg => (
                <div key={msg.id} className="message-item">
                  <strong>{msg.username}</strong> in group {msg.groupId}
                  <br />
                  <span>{msg.text}</span>
                  <br />
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  <button onClick={() => deleteMessage(msg.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="admin-content">
            <h3>System Management</h3>
            <div className="system-actions">
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ background: '#dc3545', color: 'white', padding: '10px 20px', marginBottom: '10px' }}
              >
                Clear Browser Session
              </button>
              <p>Clears all stored login data and reloads the page.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserEditForm({ user, onChange, onSave, onCancel }) {
  return (
    <div>
      <input 
        value={user.username} 
        onChange={e => onChange({...user, username: e.target.value})}
        placeholder="Username"
      />
      <input 
        value={user.email} 
        onChange={e => onChange({...user, email: e.target.value})}
        placeholder="Email"
      />
      <input 
        value={user.zipcode} 
        onChange={e => onChange({...user, zipcode: e.target.value})}
        placeholder="Zipcode"
      />
      <input 
        value={user.pronouns} 
        onChange={e => onChange({...user, pronouns: e.target.value})}
        placeholder="Pronouns"
      />
      <textarea 
        value={user.bio} 
        onChange={e => onChange({...user, bio: e.target.value})}
        placeholder="Bio"
      />
      <label className="admin-privileges-label">
        <input 
          type="checkbox" 
          checked={user.isAdmin} 
          onChange={e => onChange({...user, isAdmin: e.target.checked})}
        />
        <span>Admin Privileges</span>
        {user.isAdmin && <span className="admin-privileges-note">(Can manage users and system)</span>}
      </label>
      <div>
        <button onClick={onSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default AdminPanel;