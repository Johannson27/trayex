"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

interface University {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  photo: string | null;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export function RoutesScreen({ setActiveNav }: { setActiveNav: any }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [universities, setUniversities] = useState<University[]>([]);
  const [filtered, setFiltered] = useState<University[]>([]);
  const [selected, setSelected] = useState<University | null>(null);
  const [search, setSearch] = useState("");

  const [stops, setStops] = useState<Stop[]>([]);

  // 🟦 1. CARGAR PARADAS
  useEffect(() => {
    fetch("/managua-stops.json")
      .then((res) => res.json())
      .then((data) => setStops(data));
  }, []);

  // 🟦 2. BÚSQUEDA UNIVERSIDADES
  useEffect(() => {
    if (search.trim().length < 2) {
      setFiltered([]);
      return;
    }

    async function load() {
      const res = await fetch(`/api/universities?query=${search}`);
      const json = await res.json();
      setUniversities(json.universities || []);
      setFiltered(json.universities || []);
    }


    load();
  }, [search]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      localStorage.setItem("currentUserLocation", JSON.stringify({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        name: "Ubicación del usuario"
      }));
    });
  }, []);
  // 🟦 3. INICIALIZAR MAPA
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 12.136389, lng: -86.251389 },
      zoom: 13,
      disableDefaultUI: true,
      gestureHandling: "greedy",
    });
  }, []);

  // 🟦 4. MOSTRAR TODAS LAS PARADAS SIEMPRE
  useEffect(() => {
    if (!mapInstance.current) return;

    async function loadStops() {
      const res = await fetch("/managua-stops.json");
      const stops = await res.json();

      stops.forEach((stop: any) => {
        new google.maps.Marker({
          map: mapInstance.current!,
          position: { lat: stop.lat, lng: stop.lng },
          icon: {
            url: "/assets/parada.png",
            scaledSize: new google.maps.Size(32, 32),
          },
        });
      });
    }

    loadStops();
  }, [mapInstance.current]);

  // 🟦 5. SELECCIONAR UNIVERSIDAD → ZOOM + MARKER
  useEffect(() => {
    if (!selected || !mapInstance.current) return;

    const map = mapInstance.current;

    map.panTo({ lat: selected.lat, lng: selected.lng });
    map.setZoom(17);

    // Remover marker previo
    if ((window as any).__uniMarker) {
      (window as any).__uniMarker.setMap(null);
    }

    (window as any).__uniMarker = new google.maps.Marker({
      map,
      position: { lat: selected.lat, lng: selected.lng },
      icon: {
        url: "/assets/universidad.png",
        scaledSize: new google.maps.Size(40, 40),
      },
    });
  }, [selected]);

  // 🟦 6. RUTA DESDE PARADA MÁS CERCANA
  useEffect(() => {
    if (!selected || !mapInstance.current) return;

    async function draw() {
      const res = await fetch("/managua-stops.json");
      const stops = await res.json();

      // hallar parada más cercana
      let nearest: any = null;
      let minDist = Infinity;

      stops.forEach((stop: any) => {
        const d =
          Math.sqrt(
            Math.pow(stop.lat - selected!.lat, 2) +
            Math.pow(stop.lng - selected!.lng, 2)
          );

        if (d < minDist) {
          minDist = d;
          nearest = stop;
        }
      });

      if (!nearest) return;

      // dibujar ruta
      const directions = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#0B5FFF",
          strokeWeight: 5,
        },
      });

      renderer.setMap(mapInstance.current!);

      directions.route(
        {
          origin: { lat: nearest.lat, lng: nearest.lng },
          destination: { lat: selected!.lat, lng: selected!.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result) => renderer.setDirections(result)
      );
    }

    draw();
  }, [selected]);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen bg-white">

      {/* ▪️ Mapa */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* ▪️ Buscador */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[88%] z-20">
        <div className="bg-white rounded-full shadow-lg px-4 h-12 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar universidad"
            className="flex-1 text-sm bg-transparent outline-none"
          />
        </div>
      </div>

      {/* ▪️ Lista */}
      {!selected && (
        <div className="absolute top-24 w-full px-4 pb-32 space-y-3 z-20">
          {filtered.map((u) => (
            <button
              key={u.placeId}
              onClick={() => setSelected(u)}
              className="bg-white w-full rounded-2xl shadow-md p-3 flex gap-3 items-center"
            >
              <Image
                src={u.photo || "/assets/parada.png"}
                width={70}
                height={70}
                alt="Foto"
                className="rounded-lg object-cover"
              />
              <div className="text-left">
                <p className="font-semibold text-slate-800">{u.name}</p>
                <p className="text-xs text-gray-500">{u.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ▪️ Tarjeta inferior */}
      {selected && (
        <div className="absolute bottom-20 left-0 right-0 px-4 z-30">
          <div
            className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer"
            onClick={() => {
              localStorage.setItem("selectedUniversity", JSON.stringify(selected));
              setActiveNav("pass");
            }}
          >
            <div className="relative h-40 w-full">
              <Image
                src={selected.photo || "/assets/parada.png"}
                alt="Foto"
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {selected.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{selected.address}</p>

              <button className="mt-3 w-full py-2 rounded-full bg-slate-900 text-white text-sm">
                Reservar aquí →
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelected(null)}
            className="text-white mt-2 text-center underline"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
