import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

const ZoomHandler = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
};

const MapComponent = ({ activities, darkMode }) => {
  const defaultCenter = [39.8283, -98.5795]; // Geographic center of US
  const [currentZoom, setCurrentZoom] = useState(4);
  const [selectedHour, setSelectedHour] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);
  
  // Get unique hours from activities
  const availableHours = useMemo(() => {
    if (!activities.length) return [];
    const hours = activities.map(activity => {
      const date = new Date(activity.timestamp);
      return date.getHours();
    }).sort((a, b) => a - b);
    return [...new Set(hours)];
  }, [activities]);
  
  // Filter activities by selected hour
  const filteredActivities = useMemo(() => {
    if (selectedHour === 'all') return activities;
    return activities.filter(activity => {
      const date = new Date(activity.timestamp);
      return date.getHours() === selectedHour;
    });
  }, [activities, selectedHour]);
  
  // Play functionality
  useEffect(() => {
    if (isPlaying && availableHours.length > 0) {
      const interval = setInterval(() => {
        setSelectedHour(prev => {
          if (prev === 'all') return availableHours[0];
          const currentIndex = availableHours.indexOf(prev);
          if (currentIndex >= availableHours.length - 1) {
            setIsPlaying(false);
            return 'all';
          }
          return availableHours[currentIndex + 1];
        });
      }, 1000);
      setPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }
  }, [isPlaying, availableHours, playInterval]);
  
  const handlePlay = () => {
    if (availableHours.length === 0) return;
    setIsPlaying(!isPlaying);
    if (selectedHour === 'all') {
      setSelectedHour(availableHours[0]);
    }
  };
  
  const formatHour = (hour) => {
    if (hour === 'all') return 'All Hours';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };
  
  // Group nearby activities to prevent clustering
  const groupedActivities = useMemo(() => {
    const groups = [];
    const processed = new Set();
    
    filteredActivities.forEach((activity, index) => {
      if (processed.has(index)) return;
      
      const group = [activity];
      processed.add(index);
      
      // Find nearby activities (within ~0.01 degrees, roughly 1km)
      filteredActivities.forEach((otherActivity, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const distance = Math.sqrt(
          Math.pow(activity.location.lat - otherActivity.location.lat, 2) +
          Math.pow(activity.location.lng - otherActivity.location.lng, 2)
        );
        
        if (distance < 0.01) {
          group.push(otherActivity);
          processed.add(otherIndex);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  }, [filteredActivities]);
  
  const createCustomIcon = (activityType, count = 1) => {
    const color = activityColors[activityType] || '#9b59b6';
    // Scale size based on zoom level (smaller when zoomed out)
    const baseSize = 20;
    const minSize = 8;
    const size = Math.max(minSize, baseSize * (currentZoom / 8));
    const fontSize = Math.max(6, size * 0.5);
    
    const html = count > 1 
      ? `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px;">${count}</div>`
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
    <div>
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        minZoom={3}
        maxBounds={[[-25, -190], [80, -50]]}
        style={{ height: '400px', width: '100%' }}
      >
      <ZoomHandler onZoomChange={setCurrentZoom} />
      <TileLayer
        url={tileUrl}
        attribution='&copy; OpenStreetMap contributors'
      />
      {groupedActivities.map((group, groupIndex) => {
        const primaryActivity = group[0];
        const count = group.length;
        const mostCommonType = group.reduce((acc, activity) => {
          acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
          return acc;
        }, {});
        const dominantType = Object.keys(mostCommonType).reduce((a, b) => 
          mostCommonType[a] > mostCommonType[b] ? a : b
        );
        
        return (
          <Marker
            key={`group-${groupIndex}`}
            position={[primaryActivity.location.lat, primaryActivity.location.lng]}
            icon={createCustomIcon(dominantType, count)}
          >
            <Popup>
              <div>
                {count > 1 ? (
                  <>
                    <h4>{count} Activities in this area</h4>
                    {group.map((activity, idx) => (
                      <div key={activity.id} style={{marginBottom: '10px', paddingBottom: '10px', borderBottom: idx < group.length - 1 ? '1px solid #eee' : 'none'}}>
                        <strong>{activity.groupName}</strong> - {activity.activityType}<br/>
                        <small>{activity.description}</small><br/>
                        <small>Contact: <a href={`mailto:${activity.contact?.email}`}>{activity.contact?.email}</a></small><br/>
                        <small>{new Date(activity.timestamp).toLocaleDateString()}</small>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <h4>{primaryActivity.groupName}</h4>
                    <p><strong>{primaryActivity.activityType}</strong></p>
                    <p>{primaryActivity.description}</p>
                    <small>Contact: <a href={`mailto:${primaryActivity.contact?.email}`}>{primaryActivity.contact?.email}</a></small><br/>
                    <small>{new Date(primaryActivity.timestamp).toLocaleDateString()}</small>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
      </MapContainer>
      
      {/* Time Controls */}
      <div className="map-time-controls">
        <button 
          onClick={handlePlay}
          disabled={availableHours.length === 0}
          className={`map-play-btn ${isPlaying ? 'playing' : ''}`}
        >
          {isPlaying ? '⏸️' : '▶️'} {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <select 
          value={selectedHour}
          onChange={(e) => {
            setIsPlaying(false);
            setSelectedHour(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
          }}
          className="map-hour-select"
        >
          <option value="all">All Hours</option>
          {availableHours.map(hour => (
            <option key={hour} value={hour}>{formatHour(hour)}</option>
          ))}
        </select>
        
        <span className="map-activity-count">
          Showing: {formatHour(selectedHour)} ({filteredActivities.length} activities)
        </span>
      </div>
    </div>
  );
};

export default MapComponent;