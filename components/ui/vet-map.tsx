"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface IconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as IconPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const emergencyIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "emergency-marker",
});

type VetsHospital = {
  id: string;
  name?: string;
  address?: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  facilityType?: string;
  isEmergency?: boolean;
  tags?: {
    amenity?: string;
    healthcare?: string;
    operator?: string;
    brand?: string;
  };
};

interface VetMapProps {
  vet: VetsHospital;
  className?: string;
}

const VetMap: React.FC<VetMapProps> = ({ vet, className }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[vet.lat, vet.lon]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className={className}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={[vet.lat, vet.lon]}
        icon={vet.isEmergency ? emergencyIcon : new L.Icon.Default()}
      >
        <Popup>
          <div style={{ fontSize: "14px", minWidth: "200px" }}>
            <strong style={{ color: vet.isEmergency ? "#dc3545" : "#2c3e50" }}>
              {vet.name || "Veterinary Service"}
              {vet.isEmergency && (
                <span style={{ color: "#dc3545", marginLeft: "8px" }}>🚨</span>
              )}
            </strong>
            <br />
            {vet.address && (
              <>
                <strong>Address:</strong> {vet.address}
                <br />
              </>
            )}
            {vet.phone && (
              <>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${vet.phone}`} style={{ color: "#007bff" }}>
                  {vet.phone}
                </a>
                <br />
              </>
            )}
            {vet.website && (
              <>
                <strong>Website:</strong>{" "}
                <a
                  href={vet.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff" }}
                >
                  Visit Website
                </a>
                <br />
              </>
            )}
            {vet.openingHours && (
              <>
                <strong>Hours:</strong> {vet.openingHours}
                <br />
              </>
            )}
            <small style={{ color: "#6c757d" }}>
              {vet.facilityType || "Veterinary Service"}
            </small>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default VetMap;
