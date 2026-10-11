import LevelBadge from './LevelBadge.jsx';
import { districtName, fmtNum, formatSourceName, titleCase } from '../lib/format.js';

export function reasonsFor(source, lang) {
  if (lang === 'local' && source.reasonsLocal?.length) return { list: source.reasonsLocal, fallback: false };
  return { list: source.reasons || [], fallback: lang === 'local' && (source.reasons?.length || 0) > 0 };
}

export default function SourceList({
  items,
  rankById,
  selectedId,
  onSelect,
  lang,
  viewMode = 'card',
}) {
  if (viewMode === 'table') {
    return (
      <div className="table-wrap source-table-wrap">
        <table className="source-table" aria-label="Water source inspection table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Source ID</th>
              <th>Village</th>
              <th>District</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Key Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => {
              const rank = rankById.get(s.id);
              const { list } = reasonsFor(s, lang);
              const selected = s.id === selectedId;
              const displayName = formatSourceName(s.village ?? s.id);
              return (
                <tr
                  key={s.id}
                  className={`source-table-row ${selected ? 'is-selected' : ''}`}
                  onClick={() => onSelect(s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="rank-cell">
                    <span className="table-rank-badge">{rank ?? '–'}</span>
                  </td>
                  <td className="mono">{s.id}</td>
                  <td>
                    <strong>{displayName}</strong>
                  </td>
                  <td>{districtName(s.district)}</td>
                  <td>{s.sourceType ? titleCase(s.sourceType) : '—'}</td>
                  <td>
                    <LevelBadge level={s.level} score={s.score} />
                  </td>
                  <td className="table-reason-cell">
                    {list.length > 0 ? list[0] : <span className="muted">None</span>}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(s.id);
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ol className="source-list">
      {items.map((s) => {
        const rank = rankById.get(s.id);
        const { list, fallback } = reasonsFor(s, lang);
        const selected = s.id === selectedId;
        const displayName = formatSourceName(s.village ?? s.id);
        return (
          <li key={s.id}>
            <button
              type="button"
              className={`source-card${selected ? ' is-selected' : ''}`}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelect(s.id)}
            >
              <span className="rank" aria-label={rank ? `Rank ${rank}` : 'Not ranked'}>
                {rank ?? '–'}
              </span>
              <span className="source-main">
                <span className="source-top">
                  <span className="source-name-wrap">
                    <span className="source-name">{displayName}</span>
                  </span>
                  <LevelBadge level={s.level} score={s.score} />
                </span>
                <span className="source-meta">
                  {districtName(s.district)} · {s.sourceType ? titleCase(s.sourceType) : 'Source type not provided'} ·{' '}
                  <span className="mono">{s.id}</span>
                </span>
                {list.length > 0 ? (
                  <span className="source-reasons">
                    {list.slice(0, 2).join(' · ')}
                    {list.length > 2 && <span className="more"> +{list.length - 2} more</span>}
                    {fallback && <span className="tag">English</span>}
                  </span>
                ) : (
                  <span className="source-reasons muted">No reasons provided yet.</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
