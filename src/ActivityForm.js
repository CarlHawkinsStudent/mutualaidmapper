import React, { useState } from 'react';

const API_BASE = window.location.origin;

const ActivityForm = ({ onActivitySubmit, groups, user }) => {
  const [groupId, setGroupId] = useState(groups?.[0]?._id || '');
  const [activityType, setActivityType] = useState('Food Distribution');
  const [description, setDescription] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate zipcode using Zippopotam.us
    const addressResponse = await fetch(`${API_BASE}/api/validate-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zipcode }),
    });

    if (!addressResponse.ok) {
      const errorData = await addressResponse.json().catch(() => ({ error: 'Unknown error' }));
      alert(`Invalid zipcode: ${errorData.error}`);
      return;
    }

    const addressData = await addressResponse.json();
    const coords = [addressData.coordinates.lat, addressData.coordinates.lng];

    const selectedGroup = groups.find(g => g._id === groupId);

    const newActivity = {
      groupName: selectedGroup ? selectedGroup.name : '',
      activityType,
      description,
      contact: {
        email,
        phone: phone || null
      },
      location: {
        lat: coords[0],
        lng: coords[1],
        city: addressData.address.city,
        state: addressData.address.state,
        zipcode,
        centeringLevel: addressData.centeringLevel
      },
    };

    try {
      await onActivitySubmit(newActivity);

      // Clear form fields only after successful submission
      setGroupId(groups?.[0]?._id || '');
      setDescription('');
      setZipcode('');
      setEmail(user?.email || '');
      setPhone('');
    } catch (error) {
      alert(`Error: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="activity-form">
      <h2>Submit an Activity</h2>
      <form onSubmit={handleSubmit}>
        <select value={groupId} onChange={e => setGroupId(e.target.value)} required>
          <option value="" disabled>Select Group</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>{group.name}</option>
          ))}
        </select>
        <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
          <option>Food Distribution</option>
          <option>Shelter</option>
          <option>Medical Supplies</option>
          <option>Clothing Drive</option>
          <option>Other</option>
        </select>

        <input 
          type="text" 
          value={zipcode} 
          onChange={(e) => setZipcode(e.target.value)} 
          placeholder="Enter Zipcode" 
          pattern="[0-9]{5}" 
          maxLength="5"
          required 
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Contact Email (required)" 
          required 
        />
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          placeholder="Phone Number (optional)" 
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Activity Description..."
        />
        <button type="submit">Submit Activity</button>
      </form>
    </div>
  );
};

export default ActivityForm;
/ActivityForm onActivitySubmit={handleActivitySubmit} groups={userGroups} /