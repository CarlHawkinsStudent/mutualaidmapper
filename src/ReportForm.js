import React, { useState } from 'react';

const ReportForm = ({ onReportSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [activityType, setActivityType] = useState('Food Distribution');
  const [description, setDescription] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate zipcode using Zippopotam.us
    const addressResponse = await fetch('http://localhost:5000/api/validate-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zipcode }),
    });
    
    if (!addressResponse.ok) {
      alert('Invalid zipcode. Please enter a valid US zipcode.');
      return;
    }
    
    const addressData = await addressResponse.json();
    const coords = [addressData.coordinates.lat, addressData.coordinates.lng];
    
    const newReport = {
      groupName,
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

    console.log('Submitting report:', newReport);
    console.log('Contact info being sent:', newReport.contact);
    
    try {
      await onReportSubmit(newReport);
      
      // Clear form fields only after successful submission
      setGroupName('');
      setDescription('');
      setZipcode('');
      setEmail('');
      setPhone('');
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(`Error: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="report-form">
      <h2>Report an Activity</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={groupName} 
          onChange={(e) => setGroupName(e.target.value)} 
          placeholder="Group Name" 
          required 
        />
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
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;