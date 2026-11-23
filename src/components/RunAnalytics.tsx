import { useId } from "react";
import type { Encounter } from "../types";
import { summarizeEncounters } from "../run/analytics";

export default function RunAnalytics({ encounters }: { encounters: readonly Encounter[] }) {
  const headingId = useId();
  const summary = summarizeEncounters(encounters);
  const rate = summary.deathRate === null ? "Not available — no encounters" :
    new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(summary.deathRate);
  return (
    <section aria-labelledby={headingId} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-3">
      <h2 id={headingId} className="text-xl font-semibold text-white">Run analytics</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><dt className="text-sm text-gray-400">Total encounters</dt><dd className="text-white">{summary.total}</dd></div>
        <div><dt className="text-sm text-gray-400">Current deaths</dt><dd className="text-white">{summary.deaths}</dd></div>
        <div><dt className="text-sm text-gray-400">Death rate</dt><dd className="text-white">{rate}</dd></div>
        <div className="min-w-0"><dt className="text-sm text-gray-400">Most common caught species</dt>
          <dd className="text-white break-words">
            {summary.mostCaughtSpecies.length === 0 ? "No encounters yet" : (
              <>
                {summary.mostCaughtSpecies.length > 1 && <span>Tied: </span>}
                {summary.mostCaughtSpecies.join(", ")} ({summary.mostCaughtCount} each)
              </>
            )}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-gray-400">Death rate is current Dead encounters divided by all saved encounters, including Team and Boxed. Species counts include every status. These are current records; deleting encounters or changing statuses updates the summary.</p>
    </section>
  );
}
