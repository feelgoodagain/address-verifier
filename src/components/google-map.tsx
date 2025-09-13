'use client';
import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef } from 'react';

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  markerLabel?: string;
  className?: string;
};

export default function GoogleMap({
  lat,
  lng,
  zoom = 14,
  markerLabel = 'A',
  className = 'h-64 w-full rounded-xl ring-1 ring-[--color-border]'
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !ref.current) return;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      mapIds: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? [process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY] : undefined,
    });

    let map: google.maps.Map | null = null;
    let marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null = null;

    (async () => {
      const { Map } = await loader.importLibrary('maps');
      try {
        const { AdvancedMarkerElement } = (await loader.importLibrary('marker')) as google.maps.MarkerLibrary;
        map = new Map(ref.current as HTMLDivElement, {
          center: { lat, lng },
          zoom,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined,
          disableDefaultUI: false,
        });
        marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: markerLabel,
        });
      } catch {
        const { Marker } = await loader.importLibrary('marker');
        map = new Map(ref.current as HTMLDivElement, {
          center: { lat, lng },
          zoom,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined,
          disableDefaultUI: false,
        });
        marker = new (Marker as any)({
          map,
          position: { lat, lng },
          label: markerLabel,
        });
      }
    })();

    return () => {
      if (ref.current) ref.current.innerHTML = '';
      map = null;
      marker = null;
    };
  }, [lat, lng, zoom, markerLabel]);

  return <div ref={ref} className={className} />;
}
