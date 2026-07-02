import { useMemo } from 'react';
import { Badge } from './ui/Badge';
import { ExternalLink } from 'lucide-react';
import type { HistoryEntry } from '../shared/types';

interface SummaryViewProps {
  entry: HistoryEntry;
}

export function SummaryView({ entry }: SummaryViewProps) {
  const { summary, pageTitle, pageUrl, url, createdAt } = entry;

  const blockCount = useMemo(
    () => summary.preferencesAnalysis.filter((p) => p.severity === 'block' && p.matched).length,
    [summary.preferencesAnalysis]
  );
  const warnCount = useMemo(
    () => summary.preferencesAnalysis.filter((p) => p.severity === 'warn' && p.matched).length,
    [summary.preferencesAnalysis]
  );

  const severity = blockCount > 0 ? 'destructive' : warnCount > 0 ? 'warning' : 'secondary';
  const severityLabel = blockCount > 0 ? 'Dealbreakers found' : warnCount > 0 ? 'Warnings found' : 'Looks acceptable';

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{pageTitle || 'Terms of Service'}</h2>
          <Badge variant={severity}>{severityLabel}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          Analyzed on {new Date(createdAt).toLocaleString()}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View original Terms of Service
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <p className="text-xs text-gray-500">Source page: {pageUrl}</p>
      </header>

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className="text-lg font-semibold mb-2">
          Summary
        </h3>
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
          {summary.summary}
        </div>
      </section>

      {summary.keyPoints.length > 0 && (
        <section aria-labelledby="key-points-heading">
          <h3 id="key-points-heading" className="text-lg font-semibold mb-2">
            Key Points
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-gray-800">
            {summary.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.dataUsage && (
        <section aria-labelledby="data-usage-heading">
          <h3 id="data-usage-heading" className="text-lg font-semibold mb-2">
            Data Usage
          </h3>
          <p className="text-gray-800 whitespace-pre-wrap">{summary.dataUsage}</p>
        </section>
      )}

      {summary.restrictions.length > 0 && (
        <section aria-labelledby="restrictions-heading">
          <h3 id="restrictions-heading" className="text-lg font-semibold mb-2">
            Restrictions
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-gray-800">
            {summary.restrictions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.termination && (
        <section aria-labelledby="termination-heading">
          <h3 id="termination-heading" className="text-lg font-semibold mb-2">
            Termination
          </h3>
          <p className="text-gray-800 whitespace-pre-wrap">{summary.termination}</p>
        </section>
      )}

      {summary.redFlags.length > 0 && (
        <section aria-labelledby="red-flags-heading">
          <h3 id="red-flags-heading" className="text-lg font-semibold mb-2 text-red-700">
            Red Flags
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-red-800">
            {summary.redFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.preferencesAnalysis.length > 0 && (
        <section aria-labelledby="preferences-heading">
          <h3 id="preferences-heading" className="text-lg font-semibold mb-2">
            Privacy Preferences Analysis
          </h3>
          <div className="space-y-2">
            {summary.preferencesAnalysis.map((pref) => (
              <div
                key={pref.preferenceId}
                className={`rounded-lg border p-3 ${pref.matched ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={pref.matched ? (pref.severity === 'block' ? 'destructive' : 'warning') : 'secondary'}>
                    {pref.matched ? (pref.severity === 'block' ? 'Dealbreaker' : 'Warning') : 'Not found'}
                  </Badge>
                  <span className="font-medium">{pref.label}</span>
                </div>
                {pref.explanation && (
                  <p className="mt-1 text-sm text-gray-700">{pref.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
