// components/MapPreview.tsx
"use client";
import { cn } from "@/lib/utils";
import GoogleMapReact, { Props as GoogleMapReactProps } from "google-map-react";

interface MarkerProps {
  lat: number;
  lng: number;
}

const Marker = ({ lat, lng }: MarkerProps) => (
  <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white" />
);

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
}

const GoogleMapReactComponent = GoogleMapReact as unknown as React.FC<GoogleMapReactProps>;

export function MapPreview({
  latitude,
  longitude,
  zoom = 10,
  className = "h-[500px]",
}: MapPreviewProps) {
  const center = { lat: latitude, lng: longitude };

  const mapOptions = (maps: any) => ({
    draggable: false,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    fullscreenControl: true,
    mapTypeControl: false,
  });

  return (
    <div className={cn(`w-full rounded overflow-hidden`, className)}>
      <GoogleMapReactComponent
        bootstrapURLKeys={{
          key: "AIzaSyBjKx_4B8fBfnnTNB2c8qlyAT3p2OoNt6c",
        }}
        defaultCenter={center}
        defaultZoom={zoom}
        center={center}
        options={mapOptions}
      >
        <Marker lat={latitude} lng={longitude} />
      </GoogleMapReactComponent>
    </div>
  );
}
