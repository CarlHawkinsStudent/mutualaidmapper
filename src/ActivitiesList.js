import React from 'react';

const ActivitiesList = ({ activities }) => {
  return (
    <div className="activities-list">
      <h2>Recent Activities</h2>
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <h3>{activity.groupName} - {activity.activityType}</h3>
          <p>{activity.description}</p>
          <small>Contact: 
            <a href={`mailto:${activity.contact?.email}`}>{activity.contact?.email || 'No email'}</a>
            {activity.contact?.phone ? (
              <> | <a href={`tel:${activity.contact.phone}`}>{activity.contact.phone}</a></>
            ) : ''}
          </small><br/>
          <small>Location: {activity.location.city || 'Unknown'}, {activity.location.state || 'Unknown'} {activity.location.zipcode}</small><br/>
          <small>Submitted: {new Date(activity.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default ActivitiesList;