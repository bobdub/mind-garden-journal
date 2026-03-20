import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MetricsEntry } from '@/uqrc/metrics';

interface LearningLineProps {
  entries: MetricsEntry[];
}

const LINES = [
  { key: 'semanticDivergence', label: 'Divergence', color: 'hsl(var(--primary))' },
  { key: 'attractorDistance', label: 'Attractor Dist', color: 'hsl(var(--secondary))' },
  { key: 'memoryAlignment', label: 'Memory Align', color: 'hsl(var(--neural))' },
  { key: 'entropyGate', label: 'Entropy Gate', color: 'hsl(var(--warning))' },
  { key: 'curvatureMagnitude', label: 'Curvature', color: 'hsl(var(--success))' },
] as const;

export const LearningLine = ({ entries }: LearningLineProps) => {
  const data = useMemo(
    () =>
      entries.map((e) => ({
        step: e.step,
        semanticDivergence: +e.semanticDivergence.toFixed(4),
        attractorDistance: +e.attractorDistance.toFixed(4),
        memoryAlignment: +e.memoryAlignment.toFixed(4),
        entropyGate: +e.entropyGate.toFixed(4),
        curvatureMagnitude: +e.curvatureMagnitude.toFixed(4),
      })),
    [entries]
  );

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Learning Line</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data yet. Interact with the loop to see learning evolve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-primary text-base sm:text-lg">Learning Line</CardTitle>
        <p className="text-xs text-muted-foreground">
          State vector evolution across conversation steps
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                dataKey="step"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'Step',
                  position: 'insideBottomRight',
                  offset: -4,
                  fontSize: 10,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                iconSize={8}
              />
              {LINES.map(({ key, label, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={label}
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
