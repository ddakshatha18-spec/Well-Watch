const META = {
  High: { cls: 'high', bars: 3 },
  Medium: { cls: 'medium', bars: 2 },
  Low: { cls: 'low', bars: 1 },
};

// Never colour-only: the word and the bar count carry the meaning too.
export default function LevelBadge({ level, score }) {
  const m = META[level];
  return (
    <span className={`level level-${m ? m.cls : 'none'}`}>
      <span className="level-bars" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} className={m && i <= m.bars ? 'on' : ''} />
        ))}
      </span>
      <span>{level ?? 'Not scored'}</span>
      {score !== null && score !== undefined && <span className="level-score">{score.toFixed(2)}</span>}
    </span>
  );
}
