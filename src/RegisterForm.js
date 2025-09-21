import React, { useState } from 'react';

const API_BASE = window.location.origin;

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, zipcode, pronouns, bio })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      onRegister();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <input type="text" value={zipcode} onChange={e => setZipcode(e.target.value)} placeholder="Zipcode (optional)" pattern="[0-9]{5}" maxLength="5" />
      <input type="text" value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="Pronouns (optional)" />
      <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief intro (optional)" rows="3" />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;