
import React, { useRef, useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

export default function GoogleMapPicker({ lat, lng, onLocationChange, height = 300 }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
  setError('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
      setLoading(false);
      return;
    }
    if (!window.google || !window.google.maps) {
      // Check if script already exists
      if (!document.querySelector('script[data-google-maps]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.setAttribute('data-google-maps', 'true');
        script.onerror = () => {
          setError('Failed to load Google Maps. Check your API key and network.');
          setLoading(false);
        };
        script.onload = () => {
          setLoading(false);
          initMap();
        };
        document.body.appendChild(script);
      } else {
        // Wait for script to load
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            setLoading(false);
            initMap();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      setLoading(false);
      initMap();
    }
    // eslint-disable-next-line
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;
    if (mapInstance.current) return; // Prevent re-initialization
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: lat || 20.5937, lng: lng || 78.9629 },
      zoom: 5,
    });
    markerRef.current = new window.google.maps.Marker({
      position: { lat: lat || 20.5937, lng: lng || 78.9629 },
      map: mapInstance.current,
      draggable: true,
    });
    mapInstance.current.addListener('click', (e) => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      markerRef.current.setPosition(pos);
      onLocationChange(pos);
    });
    markerRef.current.addListener('dragend', (e) => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      onLocationChange(pos);
    });
  };

  if (error) {
    return <div style={{ color: 'red', padding: 8 }}>{error}</div>;
  }
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 16 }}>Loading map...</div>;
  }
  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height }} />
    </div>
  );
}
