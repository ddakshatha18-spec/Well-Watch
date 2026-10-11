import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Notice from './components/Notice.jsx';
import Filters from './components/Filters.jsx';
import SourceList from './components/SourceList.jsx';
import SourceDetail from './components/SourceDetail.jsx';
import ReportForm from './components/ReportForm.jsx';
import OverviewDashboard from './components/OverviewDashboard.jsx';
import Methodology from './components/Methodology.jsx';
import InspectionPlanner from './components/InspectionPlanner.jsx';
import { Empty, ErrorBox, Loading } from './components/States.jsx';
import { useSources } from './hooks/useSources.js';
import { useSourceDetail } from './hooks/useSourceDetail.js';
import { countLevels, filterSources, rankSources } from './lib/normalize.js';
import { exportSourcesToCsv } from './lib/export.js';

// The map library is large, so it loads in its own chunk
const MapView = lazy(() => import('./components/MapView.jsx'));

const LOCAL_LABEL = { hi: 'हिन्दी', te: 'తెలుగు', local: 'Hindi / Telugu' };

export default function App() {
  const [token, setToken] = useState(''); // memory only, never persisted
  const [src, reloadSources] = useSources(token);
  const [filters, setFilters] = useState({
    district: '',
    level: '',
    query: '',
    sourceType: '',
    sortBy: 'score_desc',
  });
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | map | methodology | problem
  const [viewMode, setViewMode] = useState('card'); // card | table
  const [lang, setLang] = useState('en');
  const [report, setReport] = useState(null); // { sourceId } while form is open
  const [version, setVersion] = useState(0);
  const detailRef = useRef(null);
  const opener = useRef(null);
  const reportBtn = useRef(null);

  const ranked = useMemo(() => rankSources(src.items), [src.items]);
  const rankById = useMemo(() => {
    const m = new Map();
    let r = 0;
    ranked.forEach((s) => s.score !== null && m.set(s.id, ++r));
    return m;
  }, [ranked]);
  const districts = useMemo(
    () => [...new Set(src.items.map((s) => s.district).filter(Boolean))].sort(),
    [src.items],
  );
  const visible = useMemo(() => filterSources(src.items, filters), [src.items, filters]);
  const counts = useMemo(() => countLevels(src.items), [src.items]);
  const selected = src.items.find((s) => s.id === selectedId) ?? null;
  const [detail, reloadDetail] = useSourceDetail(selected ? selected.id : null, token, version);
  const localLang = src.items.find((s) => s.reasonsLocal?.length)?.localLang;

  const select = useCallback((id) => {
    setSelectedId(id);
    const small = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 999px)').matches;
    if (small) setTimeout(() => detailRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  const openReport = (sourceId) => {
    opener.current = document.activeElement;
    setReport({ sourceId });
  };

  const closeReport = () => {
    setReport(null);
    (opener.current?.isConnected ? opener.current : reportBtn.current)?.focus?.();
  };

  const saved = (id) => {
    setVersion((v) => v + 1); // forget cached detail so new score shows
    reloadSources();
    setSelectedId(id);
  };

  let mainContent;
  if (src.status === 'loading') {
    mainContent = (
      <div className="wrap">
        <Loading label="Loading sources from the WellWatch API…" />
      </div>
    );
  } else if (src.status === 'error') {
    mainContent = (
      <div className="wrap">
        <ErrorBox error={src.error} onRetry={reloadSources} onToken={setToken} />
      </div>
    );
  } else if (src.items.length === 0) {
    mainContent = (
      <div className="wrap">
        <Empty title="No sources yet">
          The API returned an empty list. Once sources are loaded into the backend they will appear here.
        </Empty>
      </div>
    );
  } else {
    // Render based on active navigation tab
    if (activeTab === 'methodology') {
      mainContent = (
        <div className="wrap">
          <Methodology />
        </div>
      );
    } else if (activeTab === 'map') {
      mainContent = (
        <div className="wrap">
          <div className="full-map-section">
            <Filters
              districts={districts}
              filters={filters}
              onChange={setFilters}
              counts={counts}
              shown={visible.length}
              total={src.items.length}
              onExportCsv={() => exportSourcesToCsv(visible)}
            />
            <div className="full-map-layout">
              <div className="full-map-container">
                <Suspense fallback={<Loading label="Loading map…" />}>
                  <MapView items={visible} selectedId={selected?.id ?? null} onSelect={select} />
                </Suspense>
              </div>
              <div className="full-map-sidebar" ref={detailRef}>
                <SourceDetail
                  summary={selected}
                  state={detail}
                  lang={lang}
                  onRetry={reloadDetail}
                  onToken={setToken}
                  onReport={openReport}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Default: 'dashboard'
      mainContent = (
        <div className="wrap">
          <OverviewDashboard
            items={src.items}
            counts={counts}
            onOpenReport={openReport}
          />

          <div className="view-toggle seg" role="group" aria-label="Choose view">
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              Ranked list
            </button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
              Map
            </button>
          </div>

          <main className="layout" data-view={view} id="main">
            <section className="col-list" aria-label="Ranked inspection list">
              <InspectionPlanner
                items={src.items}
                onSelect={select}
                selectedId={selected?.id ?? null}
              />
              <Filters
                districts={districts}
                filters={filters}
                onChange={setFilters}
                counts={counts}
                shown={visible.length}
                total={src.items.length}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onExportCsv={() => exportSourcesToCsv(visible)}
              />
              {src.skipped > 0 && (
                <p className="hint">
                  {src.skipped} record{src.skipped > 1 ? 's were' : ' was'} ignored because{' '}
                  {src.skipped > 1 ? 'they were' : 'it was'} incomplete or duplicated.
                </p>
              )}
              {visible.length === 0 ? (
                <Empty title="No sources match these filters">
                  <button
                    type="button"
                    className="link"
                    onClick={() =>
                      setFilters({ district: '', level: '', query: '', sourceType: '', sortBy: 'score_desc' })
                    }
                  >
                    Clear filters
                  </button>
                </Empty>
              ) : (
                <SourceList
                  items={visible}
                  rankById={rankById}
                  selectedId={selected?.id ?? null}
                  onSelect={select}
                  lang={lang}
                  viewMode={viewMode}
                />
              )}
            </section>
            <div className="col-side">
              <div className="map-slot">
                <Suspense fallback={<Loading label="Loading map…" />}>
                  <MapView items={visible} selectedId={selected?.id ?? null} onSelect={select} />
                </Suspense>
              </div>
              <div ref={detailRef}>
                <SourceDetail
                  summary={selected}
                  state={detail}
                  lang={lang}
                  onRetry={reloadDetail}
                  onToken={setToken}
                  onReport={openReport}
                />
              </div>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to the ranked list
      </a>
      <Header
        hasLocal={Boolean(localLang)}
        localLabel={LOCAL_LABEL[localLang] ?? 'Local language'}
        lang={lang}
        onLang={setLang}
        onReport={openReport}
        reportRef={reportBtn}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="wrap">
        <Notice items={src.items} />
      </div>
      {mainContent}
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">WellWatch Platform</h4>
            <p>
              An inspection-prioritization decision-support tool for rural Bihar water infrastructure.
              Groundwater telemetry processed from CGWB observation stations; local village sources are synthetic
              demonstration records.
            </p>
          </div>
          <div className="footer-col">
            <h4 className="footer-title">Governance & Limits</h4>
            <p>
              WellWatch guides field inspection schedules under resource constraints. It is not a water safety
              certification or mechanical pump failure forecast.
            </p>
          </div>
          <div className="footer-col">
            <h4 className="footer-title">AWS Architecture</h4>
            <p>
              Built on AWS Serverless (API Gateway, AWS Lambda, Amazon DynamoDB, Amazon Location Service) & AWS Amplify.
            </p>
          </div>
        </div>
      </footer>
      {report && (
        <ReportForm
          sources={src.items}
          initialSourceId={report.sourceId}
          token={token}
          onToken={setToken}
          onClose={closeReport}
          onSaved={saved}
        />
      )}
    </>
  );
}
