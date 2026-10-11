export default function Notice({ items }) {
  const total = items.length;
  const synthetic = items.filter((s) => s.synthetic === true).length;
  let demo = null;
  if (total > 0 && synthetic === total) demo = `All ${total} sources shown are synthetic demonstration records, not real pumps.`;
  else if (synthetic > 0) demo = `${synthetic} of ${total} sources are labelled synthetic demonstration records.`;

  return (
    <aside className="notice" aria-label="About this data">
      <p>
        <strong>Read this first.</strong> {demo && <>{demo} </>}Water-source locations and identities are simulated for demonstration. Groundwater evidence is derived from government monitoring data and remains subject to validation.{' '}
        Groundwater trends are provisional and unverified.{' '}
        WellWatch ranks which pumps to <em>inspect first</em>. It does not predict when a pump will fail, and a low
        priority is not a guarantee that a source is safe.
      </p>
    </aside>
  );
}
