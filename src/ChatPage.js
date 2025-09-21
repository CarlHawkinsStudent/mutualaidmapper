import React, { useState, useEffect } from 'react';
import Chat from './Chat';

const API_BASE = window.location.origin;

function ChatPage({ token, user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setGroups);
  }, [token]);

  return (
    <div className="chat-page">
      <h2>Group Chat</h2>
      {!selectedGroup ? (
        <div className="group-list">
          <h3>Select a group to chat:</h3>
          {groups.length === 0 ? (
            <p>You haven't joined any groups yet. Join groups to start chatting!</p>
          ) : (
            <ul>
              {groups.map(group => (
                <li key={group._id}>
                  <button onClick={() => setSelectedGroup(group)}>
                    {group.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedGroup(null)} style={{ marginBottom: '10px' }}>
            ← Back to Groups
          </button>
          <Chat 
            token={token} 
            user={user} 
            groupId={selectedGroup._id} 
            groupName={selectedGroup.name} 
          />
        </div>
      )}
    </div>
  );
}

export default ChatPage;