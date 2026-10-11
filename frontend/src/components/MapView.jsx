import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LOCATION } from '../config.js';
import { districtName } from '../lib/format.js';

const COLOR = [
  'match',
  ['get', 'level'],
  'High', '#513229',
  'Medium', '#D9A864',
  'Low', '#8EC5EA',
  '#C8BFB0'
];

const RADIUS = [
  'match',
  ['get', 'level'],
  'High', 11,
  'Medium', 9,
  'Low', 7.5,
  6
];

function buildStyle() {
  if (LOCATION.apiKey) {
    return `https://maps.geo.${LOCATION.region}.amazonaws.com/v2/styles/Standard/descriptor?key=${encodeURIComponent(LOCATION.apiKey)}`;
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
}

export default function MapView({ items, selectedId, onSelect }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  onSelectRef.current = onSelect;

  const located = useMemo(() => items.filter((s) => s.lat !== null && s.lon !== null), [items]);
  const missing = items.length - located.length;
  const idsKey = located.map((s) => s.id).join('|');

  useEffect(() => {
    let map;
    try {
      map = new maplibregl.Map({
        container: box.current,
        style: buildStyle(),
        center: [85.5, 25.8], // Central Bihar coordinates
        zoom: 6.8,
        attributionControl: { compact: true },
      });
    } catch {
      setFailed(true);
      return undefined;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.addSource('sources', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

      // Outer glow / border
      map.addLayer({
        id: 'sources-glow',
        type: 'circle',
        source: 'sources',
        paint: {
          'circle-color': '#FFFFFF',
          'circle-radius': ['+', RADIUS, 3],
          'circle-opacity': 0.8,
        },
      });

      // Main priority circle
      map.addLayer({
        id: 'sources-circles',
        type: 'circle',
        source: 'sources',
        paint: {
          'circle-color': COLOR,
          'circle-radius': RADIUS,
          'circle-stroke-color': '#2B1B16',
          'circle-stroke-width': 2,
        },
      });

      // Selected ring
      map.addLayer({
        id: 'sources-selected',
        type: 'circle',
        source: 'sources',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': 18,
          'circle-stroke-color': '#513229',
          'circle-stroke-width': 3.5,
        },
      });

      map.on('click', 'sources-circles', (e) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        if (id) {
          onSelectRef.current(id);
          const coords = feature.geometry.coordinates.slice();
          const props = feature.properties;
          const scoreText = props.score ? ` (Score: ${Number(props.score).toFixed(2)})` : '';
          const reasonText = props.reason ? `<p style="margin:4px 0 0;font-size:12px;color:#513229;">${props.reason}</p>` : '';

          if (popupRef.current) popupRef.current.remove();
          popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: false })
            .setLngLat(coords)
            .setHTML(`
              <div style="font-family:sans-serif;padding:2px 4px;">
                <strong style="color:#2B1B16;font-size:13px;">${props.name}</strong>
                <div style="font-size:11px;color:#6B4F45;">${props.district} · ${props.id}</div>
                <div style="margin-top:4px;font-size:11px;font-weight:bold;color:${props.level === 'High' ? '#8A2D1C' : '#513229'};">
                  Priority: ${props.level}${scoreText}
                </div>
                ${reasonText}
              </div>
            `)
            .addTo(map);
        }
      });

      map.on('mouseenter', 'sources-circles', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'sources-circles', () => (map.getCanvas().style.cursor = ''));
      setReady(true);
    });

    let loaded = false;
    map.on('load', () => { loaded = true; });
    map.on('error', (e) => {
      if (!loaded && !e.tile && !e.sourceId) setFailed(true);
    });

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => map.resize());
      ro.observe(box.current);
    }
    return () => {
      ro?.disconnect();
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.getSource('sources')?.setData({
      type: 'FeatureCollection',
      features: located.map((s) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
        properties: {
          id: s.id,
          level: s.level ?? 'none',
          score: s.score,
          name: s.village ?? s.id,
          district: districtName(s.district),
          reason: s.reasons?.[0] || '',
        },
      })),
    });

    if (located.length === 1) {
      map.easeTo({ center: [located[0].lon, located[0].lat], zoom: 10, duration: 300 });
    } else if (located.length > 1) {
      const b = new maplibregl.LngLatBounds();
      located.forEach((s) => b.extend([s.lon, s.lat]));
      map.fitBounds(b, { padding: 48, maxZoom: 10, duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idsKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter('sources-selected', ['==', ['get', 'id'], selectedId ?? '']);
    const s = located.find((x) => x.id === selectedId);
    if (s) {
      map.easeTo({ center: [s.lon, s.lat], duration: 350 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  return (
    <section className="map-card" aria-label="Map of sources">
      <div className="map-card-header">
        <div className="map-card-title-wrap">
          <h3 className="map-card-title">Geographic Inspection Distribution</h3>
          <span className="map-card-subtitle">{located.length} mapped sources across Bihar</span>
        </div>
        <div className="map-card-badge">
          {LOCATION.apiKey ? 'Amazon Location Service' : 'OpenStreetMap Basemap'}
        </div>
      </div>

      <div className="map-box">
        <div
          ref={box}
          className="map-canvas"
          role="application"
          aria-label="Interactive map of Bihar village water sources. The ranked list offers the same information in text."
        />
        {failed && (
          <div className="map-fallback" role="status">
            <p>The interactive map could not render here (requires WebGL and map tile access).</p>
            <p className="hint">The ranked inspection list provides complete access to all source coordinates and priority rankings.</p>
          </div>
        )}
      </div>

      <div className="map-foot">
        <ul className="legend" aria-label="Map legend">
          <li><i className="dot dot-high" /> High Priority</li>
          <li><i className="dot dot-medium" /> Medium Priority</li>
          <li><i className="dot dot-low" /> Low Priority</li>
          <li><i className="dot dot-none" /> Unscored</li>
        </ul>
        <span className="muted">Click marker to inspect source details</span>
      </div>

      {missing > 0 && (
        <p className="hint map-note">
          {missing} source{missing > 1 ? 's have' : ' has'} no valid coordinates and {missing > 1 ? 'are' : 'is'} not shown on the map.
        </p>
      )}
    </section>
  );
}
