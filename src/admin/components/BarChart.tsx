interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  formatValue?: (v: number) => string;
}

/** Barras dibujadas a mano con SVG, sin librerías de gráficos. */
export default function BarChart({ data, height = 220, formatValue = String }: BarChartProps) {
  if (data.length === 0) return <p className="adm-empty">Sin datos para el rango seleccionado.</p>;

  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 48;
  const gap = 24;
  const width = data.length * (barWidth + gap) + gap;
  const chartHeight = height - 40;

  return (
    <div className="adm-bar-chart">
      <svg width={width} height={height} role="img" aria-label="Gráfico de barras">
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / max) * chartHeight, 2);
          const x = gap + i * (barWidth + gap);
          const y = chartHeight - barHeight;
          return (
            <g key={`${d.label}-${i}`}>
              <rect className="adm-bar-chart-bar" x={x} y={y} width={barWidth} height={barHeight} rx={4} />
              <text className="adm-bar-chart-value" x={x + barWidth / 2} y={y - 6} textAnchor="middle">
                {formatValue(d.value)}
              </text>
              <text className="adm-bar-chart-label" x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
