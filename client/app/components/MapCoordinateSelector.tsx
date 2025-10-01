/// <reference types="@types/google.maps" />
"use client";

import Script from "next/script";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { GOOGLE_MAP_KEY } from "../utils/constants";
import { Skeleton } from "./ui/Skeleton";

export type SelectedCoords = { lat: number; lng: number };

interface MapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (coords: SelectedCoords) => void;
  selectedCoords: SelectedCoords | null;
  zoom: number;
}

interface MapCoordinateSelectorProps {
  setSelectedCoords: Dispatch<SetStateAction<SelectedCoords | null>>;
  selectedCoords: SelectedCoords | null;
  zoom: number;
  loading: boolean
}

export default function MapCoordinateSelector({
  selectedCoords,
  setSelectedCoords,
  zoom,
  loading
}: MapCoordinateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_KEY}`}
        strategy="afterInteractive"
        onLoad={() => console.log("Google Maps script loaded")}
      />

      <Button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        disabled={loading}
      >
        Select From Map
      </Button>

      {isOpen && (
        <MarkerMapSelector
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={(coords) => setSelectedCoords(coords)}
          selectedCoords={selectedCoords}
          zoom={zoom}
        />
      )}
    </div>
  );
}

const MarkerMapSelector = ({
  isOpen,
  onClose,
  onSelect,
  selectedCoords,
  zoom
}: MapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker>();
  const [coords, setCoords] = useState<SelectedCoords>(
    selectedCoords ?? {
      lat: 25.276987,
      lng: 55.296249,
    }
  ); // Fallback: Dubai

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;
    if (typeof window.google === "undefined") {
      console.error("Google Maps JS API not loaded.");
      return;
    }

    const initializeMap = (position: GeolocationPosition | null) => {
      const location = position
        ? {
          lat: selectedCoords ? selectedCoords.lat : position.coords.latitude,
          lng: selectedCoords
            ? selectedCoords.lng
            : position.coords.longitude,
        }
        : { lat: 25.276987, lng: 55.296249 }; // Fallback: Dubai

      setCoords(location);

      const map = new google.maps.Map(mapRef.current!, {
        center: location,
        zoom: zoom,
      });

      const marker = new google.maps.Marker({
        position: location,
        map,
        draggable: true,
      });

      markerRef.current = marker;

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        if (lat && lng) {
          const newCoords = { lat, lng };
          marker.setPosition(newCoords);
          setCoords(newCoords);
        }
      });

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) {
          setCoords({ lat: pos.lat(), lng: pos.lng() });
        }
      });
    };

    navigator.geolocation.getCurrentPosition(
      (position) => initializeMap(position),
      () => initializeMap(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[90%] max-w-[1000px] rounded-md overflow-hidden shadow-lg">
        <div
          ref={mapRef}
          style={{ height: "600px", width: "100%" }}
          className="bg-gray-100"
        >
          <Skeleton style={{ height: "600px", width: "100%" }} />
        </div>

        <div className="flex justify-between gap-4 p-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            variant='outline'
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onSelect(coords);
              onClose();
            }}
            className="w-full"
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};
