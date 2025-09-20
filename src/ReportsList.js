import React from 'react';

const ReportsList = ({ reports }) => {
  return (
    <div className="reports-list">
      <h2>Recent Activities</h2>
      {reports.map((report) => (
        <div key={report.id} className="report-item">
          <h3>{report.groupName} - {report.activityType}</h3>
          <p>{report.description}</p>
          <small>Contact: 
            <a href={`mailto:${report.contact?.email}`}>{report.contact?.email || 'No email'}</a>
            {report.contact?.phone ? (
              <> | <a href={`tel:${report.contact.phone}`}>{report.contact.phone}</a></>
            ) : ''}
          </small><br/>
          <small>Location: {report.location.city || 'Unknown'}, {report.location.state || 'Unknown'} {report.location.zipcode}</small><br/>
          <small>Reported: {new Date(report.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default ReportsList;