import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ 
  center = [12.9716, 77.5946], // Bangalore coordinates
  zoom = 13,
  markers = [],
  polylines = [],
  height = '400px',
  showLiveTracking = false,
  onMapClick = null
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Custom icons for different marker types
  const createCustomIcon = (type, isActive = false) => {
    const colors = {
      staff: '#3B82F6',      // Blue
      lead: '#10B981',       // Green  
      branch: '#F59E0B',     // Yellow
      current: '#EF4444'     // Red for current location
    };
    
    const color = isActive ? colors.current : colors[type] || colors.staff;
    
    return new DivIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${type === 'staff' ? '👤' : type === 'lead' ? '📍' : '🏢'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (markers.length > 0) {
        // Auto-fit map to show all markers
        const bounds = markers.map(marker => [marker.latitude, marker.longitude]);
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }, [markers, map]);

    return null;
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        onclick={onMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController />
        
        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(marker.type || 'staff', marker.is_active)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  {marker.name || 'Location'}
                </h4>
                {marker.user_name && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    <strong>User:</strong> {marker.user_name}
                  </p>
                )}
                {marker.lead_name && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    <strong>Lead:</strong> {marker.lead_name}
                  </p>
                )}
                {marker.accuracy && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    <strong>Accuracy:</strong> ±{Math.round(marker.accuracy)}m
                  </p>
                )}
                {marker.timestamp && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Last Update:</strong> {new Date(marker.timestamp).toLocaleString()}
                  </p>
                )}
                {marker.address && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                    {marker.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render polylines for tracking paths */}
        {polylines.map((polyline, index) => (
          <Polyline
            key={`polyline-${index}`}
            positions={polyline.positions}
            color={polyline.color || '#3B82F6'}
            weight={polyline.weight || 3}
            opacity={polyline.opacity || 0.7}
            dashArray={polyline.dashed ? '5, 5' : null}
          />
        ))}
        
        {/* Live tracking indicator */}
        {showLiveTracking && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: '12px',
            zIndex: 1000
          }}>
            <span style={{ color: '#EF4444', fontWeight: 'bold' }}>●</span> Live Tracking
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
