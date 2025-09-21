import React, { useState, useEffect } from 'react';

const API_BASE = window.location.origin;

function ProfileModal({ userId, token, onClose, isOwnProfile = false }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [zipcode, setZipcode] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setZipcode(data.zipcode || '');
        setPronouns(data.pronouns || '');
        setBio(data.bio || '');
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, [userId, token]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ zipcode, pronouns, bio })
      });
      
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setEditing(false);
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (!profile) return <div className="modal-overlay"><div className="modal">Loading...</div></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{profile.username}'s Profile</h2>
        
        {editing ? (
          <div>
            <input 
              type="text" 
              value={zipcode} 
              onChange={e => setZipcode(e.target.value)} 
              placeholder="Zipcode" 
              pattern="[0-9]{5}" 
              maxLength="5" 
            />
            <input 
              type="text" 
              value={pronouns} 
              onChange={e => setPronouns(e.target.value)} 
              placeholder="Pronouns" 
            />
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="Brief intro" 
              rows="4" 
            />
            <div>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p><strong>Email:</strong> {profile.email}</p>
            {profile.pronouns && <p><strong>Pronouns:</strong> {profile.pronouns}</p>}
            {profile.zipcode && <p><strong>Location:</strong> {profile.zipcode}</p>}
            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
            {isOwnProfile && (
              <button onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;