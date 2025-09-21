import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ProfileModal from './ProfileModal';

const API_BASE = window.location.origin;

function Chat({ token, user, groupId, groupName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [showProfile, setShowProfile] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);
    
    newSocket.emit('join-group', groupId);
    
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch existing messages
    fetch(`${API_BASE}/api/groups/${groupId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setMessages);

    return () => newSocket.close();
  }, [groupId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    
    const messageData = {
      groupId,
      userId: user.id,
      username: user.username,
      text: newMessage.trim()
    };
    
    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="activity-form">
      <h3>Chat - {groupName}</h3>
      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            <strong 
              style={{ cursor: 'pointer', color: '#007bff' }}
              onClick={() => setShowProfile(msg.userId)}
            >
              {msg.username}:
            </strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '80%' }}
        />
        <button type="submit" style={{ width: '18%', marginLeft: '2%' }}>Send</button>
      </form>
      
      {showProfile && (
        <ProfileModal 
          userId={showProfile} 
          token={token} 
          onClose={() => setShowProfile(null)}
          isOwnProfile={showProfile === user.id}
        />
      )}
    </div>
  );
}

export default Chat;