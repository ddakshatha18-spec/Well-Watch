export default function Header({
  hasLocal,
  localLabel,
  lang,
  onLang,
  onReport,
  reportRef,
  activeTab = 'dashboard',
  onTabChange,
}) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <div className="brand-group">
          <div className="brand" onClick={() => onTabChange?.('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="brand-badge">Bihar Rural Water Infrastructure</div>
            <h1 className="wordmark">WellWatch</h1>
            <p className="tagline">Decision-support system for village drinking-water inspection priority</p>
          </div>
        </div>

        <div className="header-actions">
          {hasLocal && (
            <div className="seg" role="group" aria-label="Language of reasons">
              <button type="button" aria-pressed={lang === 'en'} onClick={() => onLang('en')}>
                English
              </button>
              <button type="button" aria-pressed={lang === 'local'} onClick={() => onLang('local')}>
                {localLabel}
              </button>
            </div>
          )}
          <button type="button" ref={reportRef} className="btn btn-light" onClick={() => onReport(null)}>
            Report observation
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      {onTabChange && (
        <nav className="site-nav" aria-label="Primary navigation">
          <div className="wrap nav-inner">
            <button
              type="button"
              className={`nav-tab ${activeTab === 'dashboard' ? 'is-active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              Inspection Dashboard
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === 'map' ? 'is-active' : ''}`}
              onClick={() => onTabChange('map')}
            >
              Interactive Map Explorer
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === 'methodology' ? 'is-active' : ''}`}
              onClick={() => onTabChange('methodology')}
            >
              Data & Methodology
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === 'problem' ? 'is-active' : ''}`}
              onClick={() => onTabChange('problem')}
            >
              Problem & Impact
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
