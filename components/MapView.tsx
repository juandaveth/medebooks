"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Place } from "@/lib/types";
import { typeColor } from "./PlaceCard";

// Basemap vectorial gratuito y minimalista (sin API key), acorde a la estética papel.
const STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MEDELLIN: [number, number] = [-75.5736, 6.2518];

function markerEl(place: Place, active: boolean): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", place.name);
  el.className = "dl-marker";
  el.style.width = active ? "20px" : "14px";
  el.style.height = active ? "20px" : "14px";
  el.style.borderRadius = "50%";
  el.style.background = typeColor(place.type);
  el.style.border = "2px solid #f6f1e7";
  el.style.boxShadow = "0 1px 4px rgba(0,0,0,.35)";
  el.style.cursor = "pointer";
  el.style.transition = "width .15s, height .15s";
  return el;
}

export function MapView({
  places,
  activeId,
  onSelect,
}: {
  places: Place[];
  activeId?: string | null;
  onSelect?: (p: Place) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const readyRef = useRef(false);

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: MEDELLIN,
      zoom: 11.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      readyRef.current = true;
      map.resize(); // el contenedor flex puede dimensionarse después del init
      renderMarkers();
    });
    mapRef.current = map;

    // Si el contenedor cambia de tamaño (layout flex, responsive), reajusta el canvas.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current!);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibuja marcadores cuando cambian los lugares filtrados.
  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    for (const place of places) {
      const el = markerEl(place, place.id === activeId);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(place);
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      markersRef.current.set(place.id, marker);
    }

    // Ajusta el encuadre a los marcadores visibles.
    if (places.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 500 });
    }
  }

  useEffect(() => {
    if (readyRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Al seleccionar, centra y resalta.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const active = id === activeId;
      el.style.width = active ? "20px" : "14px";
      el.style.height = active ? "20px" : "14px";
      el.style.zIndex = active ? "10" : "1";
    });
    if (activeId) {
      const place = places.find((p) => p.id === activeId);
      if (place) map.easeTo({ center: [place.lng, place.lat], zoom: Math.max(map.getZoom(), 14), duration: 500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
