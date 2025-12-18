import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { Button } from './button';
import { MapPin, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  defaultCenter?: [number, number];
}

// Component to handle map click events
function LocationMarker({
  position,
  setPosition,
  onLocationChange,
}: {
  position: LatLng | null;
  setPosition: (pos: LatLng | null) => void;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  );
}

// Component to recenter the map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
  defaultCenter = [30.0444, 31.2357], // Cairo, Egypt default
}: MapPickerProps) {
  const [position, setPosition] = useState<LatLng | null>(
    latitude && longitude ? new LatLng(latitude, longitude) : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : defaultCenter
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Update position when props change
  useEffect(() => {
    if (latitude && longitude) {
      setPosition(new LatLng(latitude, longitude));
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition(new LatLng(lat, lng));
        setMapCenter([lat, lng]);
        onLocationChange(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please select manually on the map.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setPosition(null);
    onLocationChange(0, 0);
  };

  if (!isOpen) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            {position ? 'Change Location' : 'Pick on Map'}
          </Button>
          {position && (
            <span className="text-sm text-muted-foreground">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Select Location</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="gap-1"
        >
          <Navigation className="h-3 w-3" />
          {isGettingLocation ? 'Getting...' : 'Use My Location'}
        </Button>
        {position && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearLocation}
          >
            Clear
          </Button>
        )}
      </div>

      <div style={{ height }} className="rounded-lg overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationChange={onLocationChange}
          />
          <RecenterMap center={mapCenter} />
        </MapContainer>
      </div>

      {position && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
          </span>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Confirm
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Click on the map to select a location, or use your current location.
      </p>
    </div>
  );
}
