import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const activityColors = {
  'Food Distribution': '#e74c3c',
  'Shelter': '#3498db',
  'Medical Supplies': '#2ecc71',
  'Clothing Drive': '#f39c12',
  'Other': '#9b59b6'
};

const MapComponent = ({ reports, darkMode }) => {
  const defaultCenter = [39.8283, -98.5795]; // Geographic center of US
  
  // Group nearby reports to prevent clustering
  const groupedReports = useMemo(() => {
    const groups = [];
    const processed = new Set();
    
    reports.forEach((report, index) => {
      if (processed.has(index)) return;
      
      const group = [report];
      processed.add(index);
      
      // Find nearby reports (within ~0.01 degrees, roughly 1km)
      reports.forEach((otherReport, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const distance = Math.sqrt(
          Math.pow(report.location.lat - otherReport.location.lat, 2) +
          Math.pow(report.location.lng - otherReport.location.lng, 2)
        );
        
        if (distance < 0.01) {
          group.push(otherReport);
          processed.add(otherIndex);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }, [reports]);
  
  const createCustomIcon = (activityType, count = 1) => {
    const color = activityColors[activityType] || '#9b59b6';
    const size = count > 1 ? 30 : 20;
    const html = count > 1 
      ? `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${count}</div>`
      : `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
    
    return L.divIcon({
      className: 'custom-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const tileUrl = darkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={4} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; OpenStreetMap contributors'
      />
      {groupedReports.map((group, groupIndex) => {
        const primaryReport = group[0];
        const count = group.length;
        const mostCommonType = group.reduce((acc, report) => {
          acc[report.activityType] = (acc[report.activityType] || 0) + 1;
          return acc;
        }, {});
        const dominantType = Object.keys(mostCommonType).reduce((a, b) => 
          mostCommonType[a] > mostCommonType[b] ? a : b
        );
        
        return (
          <Marker
            key={`group-${groupIndex}`}
            position={[primaryReport.location.lat, primaryReport.location.lng]}
            icon={createCustomIcon(dominantType, count)}
          >
            <Popup>
              <div>
                {count > 1 ? (
                  <>
                    <h4>{count} Activities in this area</h4>
                    {group.map((report, idx) => (
                      <div key={report.id} style={{marginBottom: '10px', paddingBottom: '10px', borderBottom: idx < group.length - 1 ? '1px solid #eee' : 'none'}}>
                        <strong>{report.activityType}</strong> by {report.groupName}<br/>
                        <small>{report.description}</small><br/>
                        <small>{new Date(report.timestamp).toLocaleDateString()}</small>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <h4>{primaryReport.activityType}</h4>
                    <p><strong>{primaryReport.groupName}</strong></p>
                    <p>{primaryReport.description}</p>
                    <small>{new Date(primaryReport.timestamp).toLocaleDateString()}</small>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;