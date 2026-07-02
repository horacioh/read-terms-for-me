interface ScoreGaugeProps {
  score: number;
  label: string;
  summary?: string;
}

function scoreColor(score: number): string {
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

function scoreBgColor(score: number): string {
  if (score >= 90) return 'rgba(12,206,107,0.1)';
  if (score >= 50) return 'rgba(255,164,0,0.1)';
  return 'rgba(255,78,66,0.1)';
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({ score, label, summary }: ScoreGaugeProps) {
  const color = scoreColor(score);
  const bg = scoreBgColor(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-1" title={summary}>
      <div className="relative h-[72px] w-[72px]">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full -rotate-90"
          aria-label={`${label}: ${score} out of 100`}
        >
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill={bg}
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-200"
          />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

interface ScoresOverviewProps {
  scores: {
    privacy: { score: number; summary: string };
    userRights: { score: number; summary: string };
    transparency: { score: number; summary: string };
    freedom: { score: number; summary: string };
  };
}

export function ScoresOverview({ scores }: ScoresOverviewProps) {
  const overall = Math.round(
    (scores.privacy.score + scores.userRights.score + scores.transparency.score + scores.freedom.score) / 4
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <ScoreGauge score={overall} label="Overall" />
        <div className="h-14 w-px bg-gray-200 hidden sm:block" />
        <ScoreGauge score={scores.privacy.score} label="Privacy" summary={scores.privacy.summary} />
        <ScoreGauge score={scores.userRights.score} label="User Rights" summary={scores.userRights.summary} />
        <ScoreGauge score={scores.transparency.score} label="Transparency" summary={scores.transparency.summary} />
        <ScoreGauge score={scores.freedom.score} label="Freedom" summary={scores.freedom.summary} />
      </div>
    </div>
  );
}
