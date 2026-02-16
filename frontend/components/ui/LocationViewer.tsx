'use client';

import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import dynamic from 'next/dynamic';

// Fix for default marker icon missing in React-Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationViewerProps {
    lat: number;
    lng: number;
    popupText?: string;
}

const LocationViewerHelper = ({ lat, lng, popupText }: LocationViewerProps) => {

    // Default center if 0,0 provided
    const position: [number, number] = (lat !== 0 && lng !== 0) ? [lat, lng] : [20.5937, 78.9629];

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={position}
                zoom={14}
                dragging={false}
                scrollWheelZoom={false}
                zoomControl={false}
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles-dark"
                />
                <Marker position={position}>
                    {popupText && <Popup>{popupText}</Popup>}
                </Marker>
            </MapContainer>

            {/* Overlay Grid Line Effect */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 z-[400]"
                style={{
                    background: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}>
            </div>
        </div>
    );
};

// Dynamic import wrapper
const LocationViewerDynamic = dynamic(() => Promise.resolve(LocationViewerHelper), {
    loading: () => (
        <div className="w-full h-full bg-[#111] animate-pulse flex items-center justify-center border border-white/20">
            <span className="text-white/30 font-mono">LOADING MAP DATA...</span>
        </div>
    ),
    ssr: false
});

export default function LocationViewer(props: LocationViewerProps) {
    return <LocationViewerDynamic {...props} />;
}
