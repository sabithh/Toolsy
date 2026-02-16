'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import dynamic from 'next/dynamic';

// Fix for default marker icon missing in React-Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

// Sub-component to handle map clicks
function LocationMarker({ lat, lng, onLocationChange }: LocationPickerProps) {
    const map = useMap();

    // Fly to location when props change (e.g. initial load or geolocation)
    useEffect(() => {
        if (lat !== 0 && lng !== 0) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    const markerRef = useRef<L.Marker>(null);

    useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const position = marker.getLatLng();
                    onLocationChange(position.lat, position.lng);
                }
            },
        }),
        [onLocationChange],
    );

    if (lat === 0 && lng === 0) return null;

    return (
        <Marker
            position={[lat, lng]}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        />
    );
}

const LocationPicker = ({ lat, lng, onLocationChange }: LocationPickerProps) => {
    const [loadingGeo, setLoadingGeo] = useState(false);

    const handleGetCurrentLocation = () => {
        setLoadingGeo(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onLocationChange(position.coords.latitude, position.coords.longitude);
                    setLoadingGeo(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("Could not detect location. Please enable permissions.");
                    setLoadingGeo(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setLoadingGeo(false);
        }
    };

    // Default center (New York/General or 0,0) if no location set
    const center: [number, number] = (lat !== 0 && lng !== 0) ? [lat, lng] : [20.5937, 78.9629]; // Default to India center roughly

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                    Geospatial Coordinates
                </label>
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={loadingGeo}
                    className="text-xs flex items-center gap-2 bg-[#111] hover:bg-white hover:text-black text-white px-3 py-1 border border-white/20 transition-colors uppercase font-bold tracking-wider"
                >
                    <Crosshair size={12} className={loadingGeo ? "animate-spin" : ""} />
                    {loadingGeo ? 'Scanning...' : 'Auto-Detect'}
                </button>
            </div>

            <div className="h-[400px] w-full border-2 border-[#333] relative z-0">
                <MapContainer
                    center={center}
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="map-tiles-dark"
                    />
                    <LocationMarker lat={lat} lng={lng} onLocationChange={onLocationChange} />
                </MapContainer>

                {/* Overlay Grid Line Effect */}
                <div className="absolute inset-0 pointer-events-none border border-white/5 z-[400]"
                    style={{
                        background: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs text-gray-500">
                <div className="bg-black border border-white/10 p-2">
                    LAT: <span className="text-[#DC2626]">{lat.toFixed(6)}</span>
                </div>
                <div className="bg-black border border-white/10 p-2">
                    LNG: <span className="text-[#DC2626]">{lng.toFixed(6)}</span>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
