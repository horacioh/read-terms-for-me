import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from './ui/Badge';
import { ScoresOverview } from './ScoreGauge';
import { ExternalLink } from 'lucide-react';
import type { SummaryResult } from '../shared/types';

interface SummaryViewProps {
  result: SummaryResult;
  url: string;
  title?: string;
  analyzedAt?: number;
}

export function SummaryView({ result, url, title, analyzedAt }: SummaryViewProps) {
  const { summary, keyPoints, redFlags, dataUsage, restrictions, termination, preferencesAnalysis, scores } = result;

  const blockCount = useMemo(
    () => preferencesAnalysis.filter((p) => p.severity === 'block' && p.matched).length,
    [preferencesAnalysis]
  );
  const warnCount = useMemo(
    () => preferencesAnalysis.filter((p) => p.severity === 'warn' && p.matched).length,
    [preferencesAnalysis]
  );

  const severity = blockCount > 0 ? 'destructive' : warnCount > 0 ? 'warning' : 'secondary';
  const severityLabel = blockCount > 0 ? 'Dealbreakers found' : warnCount > 0 ? 'Warnings found' : 'Looks acceptable';

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{title || 'Terms of Service'}</h2>
          <Badge variant={severity}>{severityLabel}</Badge>
        </div>
        {analyzedAt && (
          <p className="text-sm text-gray-600">Analyzed on {new Date(analyzedAt).toLocaleString()}</p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View original Terms of Service
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </header>

      {scores && <ScoresOverview scores={scores} />}

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className="text-lg font-semibold mb-2">
          Summary
        </h3>
        <div className="prose prose-sm max-w-none text-gray-800">
          <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
        </div>
      </section>

      {keyPoints.length > 0 && (
        <section aria-labelledby="key-points-heading">
          <h3 id="key-points-heading" className="text-lg font-semibold mb-2">
            Key Points
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-gray-800">
            {keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {dataUsage && (
        <section aria-labelledby="data-usage-heading">
          <h3 id="data-usage-heading" className="text-lg font-semibold mb-2">
            Data Usage
          </h3>
          <div className="prose prose-sm max-w-none text-gray-800">
            <Markdown remarkPlugins={[remarkGfm]}>{dataUsage}</Markdown>
          </div>
        </section>
      )}

      {restrictions.length > 0 && (
        <section aria-labelledby="restrictions-heading">
          <h3 id="restrictions-heading" className="text-lg font-semibold mb-2">
            Restrictions
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-gray-800">
            {restrictions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {termination && (
        <section aria-labelledby="termination-heading">
          <h3 id="termination-heading" className="text-lg font-semibold mb-2">
            Termination
          </h3>
          <div className="prose prose-sm max-w-none text-gray-800">
            <Markdown remarkPlugins={[remarkGfm]}>{termination}</Markdown>
          </div>
        </section>
      )}

      {redFlags.length > 0 && (
        <section aria-labelledby="red-flags-heading">
          <h3 id="red-flags-heading" className="text-lg font-semibold mb-2 text-red-700">
            Red Flags
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-red-800">
            {redFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      {preferencesAnalysis.length > 0 && (
        <section aria-labelledby="preferences-heading">
          <h3 id="preferences-heading" className="text-lg font-semibold mb-2">
            Privacy Preferences Analysis
          </h3>
          <div className="space-y-2">
            {preferencesAnalysis.map((pref) => (
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
