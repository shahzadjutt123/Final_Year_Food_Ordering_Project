import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import './MapComp.css';

// Rider and user marker icons
const userMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const riderMarkerIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/ios/452/delivery.png', // Custom rider icon
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const Routing = ({ userLocation, riderLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !riderLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(riderLocation.latitude, riderLocation.longitude),
        L.latLng(userLocation.latitude, userLocation.longitude),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          {
            color: 'red',
            weight: 6,
            opacity: 0.8,
          },
        ],
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'car',
      }),
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
      const route = e.routes[0];
      const { totalDistance, totalTime } = route.summary;

      const distanceKm = (totalDistance / 1000).toFixed(2); // in kilometers
      const durationMin = Math.round(totalTime / 60);       // in minutes

      // Midpoint between rider and user
      const midLat = (riderLocation.latitude + userLocation.latitude) / 2;
      const midLng = (riderLocation.longitude + userLocation.longitude) / 2;

      L.popup()
        .setLatLng([midLat, midLng])
        .setContent(`Distance: ${distanceKm} km<br>ETA: ${durationMin} mins`)
        .openOn(map);
    });

    return () => map.removeControl(routingControl);
  }, [userLocation, riderLocation]);

  return null;
};




// Map Component
const MapComponent = ({ userLocation, riderLocation }) => {
  const center = riderLocation
    ? [riderLocation.latitude, riderLocation.longitude]
    : [userLocation.latitude, userLocation.longitude];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {/* Rider Marker */}
      {riderLocation && (
        <Marker
          position={[riderLocation.latitude, riderLocation.longitude]}
          icon={riderMarkerIcon}  // Custom rider marker icon
        >
          <Popup>Rider is here 🚴‍♂️</Popup>
        </Marker>
      )}

      {/* User Marker */}
      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userMarkerIcon}  // Default user marker icon
        >
          <Popup>This is your delivery location 📍</Popup>
        </Marker>
      )}

      {/* Routing path between user and rider */}
      {userLocation && riderLocation && (
        <Routing userLocation={userLocation} riderLocation={riderLocation} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
