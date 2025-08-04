"use client";
import { useEffect, useState } from "react";
import { FaMap } from "react-icons/fa";
import { useHttp } from "@/lib/request-hook";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorModal from "@/components/ui/error";
import VetMap from "@/components/ui/vet-map";
import styles from "./vet-hospital-list.module.css";

// Updated type definition
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

type VetsHospitalResponse = {
  success: boolean;
  message: string;
  data: VetsHospital[];
  count?: number;
};

// Updated Map Modal Component using the new VetMap component
const MapModal = ({
  vet,
  onClose,
}: {
  vet: VetsHospital;
  onClose: () => void;
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {vet.name || "Veterinary Service"} - Location
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.mapContainer}>
          <VetMap vet={vet} />
        </div>

        <div className={styles.mapInfo}>
          <div>
            <strong>Address:</strong> {vet.address || "No address available"}
          </div>
          <div>
            <strong>Coordinates:</strong> {vet.lat.toFixed(6)},{" "}
            {vet.lon.toFixed(6)}
          </div>
          <div className={styles.mapLinks}>
            <a
              href={`https://www.openstreetmap.org/?mlat=${vet.lat}&mlon=${vet.lon}&zoom=15`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              <FaMap />
              View on OpenStreetMap
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated component with better display
const VetsHospitalList = () => {
  const [vets, setVets] = useState<VetsHospital[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedVet, setSelectedVet] = useState<VetsHospital | null>(null);
  const { isLoading, sendRequest, error, clearError } =
    useHttp<VetsHospitalResponse>();

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude);
        console.log(longitude);
        try {
          const response = await sendRequest(
            "/api/vets/nearby-vets",
            "POST",
            JSON.stringify({ lat: latitude, lng: longitude, radius: 10000 }),
            { "Content-Type": "application/json" }
          );
          setVets(response.data);
        } catch {}
      },
      (err) => {
        setGeoError(err.message || "Failed to retrieve location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [sendRequest]);

  if (geoError) {
    return (
      <ErrorModal
        error={{ title: "Geolocation Error", message: geoError }}
        clearError={() => setGeoError(null)}
      />
    );
  }

  if (error) {
    return <ErrorModal error={error} clearError={clearError} />;
  }

  if (isLoading || vets.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner
          variant="pulse"
          size="large"
          text="Fetching nearby vets..."
        />
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.pageTitle}>
        Nearby Veterinary Clinics & Hospitals
      </h1>
      <p className={styles.resultsCount}>
        Found {vets.length} veterinary services near you
      </p>

      {selectedVet && (
        <MapModal vet={selectedVet} onClose={() => setSelectedVet(null)} />
      )}

      <div className={styles.vetsList}>
        {vets.map((vet) => (
          <div
            key={vet.id}
            className={`${styles.vetCard} ${
              vet.isEmergency ? styles.emergency : ""
            }`}
          >
            {vet.isEmergency && (
              <div className={styles.emergencyBadge}>EMERGENCY</div>
            )}

            <div className={styles.vetHeader}>
              <h3 className={styles.vetName}>
                {vet.name || "Unnamed Veterinary Service"}
              </h3>
              <span className={styles.facilityTypeBadge}>
                {vet.facilityType || "Veterinary Service"}
              </span>
            </div>

            {vet.address && (
              <div className={styles.infoRow}>
                <strong>Address:</strong> {vet.address}
              </div>
            )}

            {vet.phone && (
              <div className={styles.infoRow}>
                <strong>Phone:</strong>
                <a href={`tel:${vet.phone}`} className={styles.contactLink}>
                  {vet.phone}
                </a>
              </div>
            )}

            {vet.website && (
              <div className={styles.infoRow}>
                <strong>Website:</strong>
                <a
                  href={vet.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Visit Website
                </a>
              </div>
            )}

            {vet.email && (
              <div className={styles.infoRow}>
                <strong>Email:</strong>
                <a href={`mailto:${vet.email}`} className={styles.contactLink}>
                  {vet.email}
                </a>
              </div>
            )}

            {vet.openingHours && (
              <div className={styles.infoRow}>
                <strong>Opening Hours:</strong> {vet.openingHours}
              </div>
            )}

            <div className={styles.cardFooter}>
              <button
                onClick={() => setSelectedVet(vet)}
                className={styles.showMapButton}
              >
                <FaMap />
                Show on Map
              </button>
            </div>
          </div>
        ))}
      </div>

      {vets.length === 0 && (
        <div className={styles.noResults}>
          No veterinary services found in your area. Try increasing the search
          radius.
        </div>
      )}
    </div>
  );
};

export default VetsHospitalList;
