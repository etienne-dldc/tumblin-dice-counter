import clsx from "clsx";
import { Fragment, useMemo } from "react";
import { mapNum } from "../utils/functions";

const WIDTH = 1000;
const HEIGHT = 500;
const PADDING = 20;
const GAP = 10;
const LEGEND_WIDTH = 30;

const GRAPH_WIDTH = WIDTH - PADDING * 2 - LEGEND_WIDTH - GAP;
const GRAPH_HEIGHT = HEIGHT - PADDING * 2;

interface ChartProps {
  data: number[][];
  selected: number | null;
}

export function Chart({ data, selected }: ChartProps) {
  const maxScore = useMemo(() => {
    const max = Math.max(...data.map((line) => Math.max(...line)));
    return Math.max(Math.ceil(max / 50) * 50, 350);
  }, [data]);

  return (
    <div className="aspect-[1000/500]">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="bg-slate-100 rounded">
        <g transform={`translate(${PADDING}, ${PADDING})`}>
          {/* Graph */}
          <g transform={`translate(${LEGEND_WIDTH + GAP}, 0)`}>
            <Grid maxScore={maxScore} rounds={data[0].length + 1} />
            {data.map((line, index) => {
              if (selected === index) {
                return null;
              }
              return <PlayerLine maxScore={maxScore} line={line} key={index} dimmed={selected !== null} />;
            })}
            {selected !== null && <PlayerLine selected maxScore={maxScore} line={data[selected]} dimmed={false} />}
          </g>
          {/* Legend */}
        </g>
      </svg>
    </div>
  );
}

interface PlayerLineProps {
  line: number[];
  dimmed: boolean;
  maxScore: number;
  selected?: boolean;
}

function PlayerLine({ line, dimmed, maxScore, selected = false }: PlayerLineProps) {
  const points = useMemo(() => {
    return line.map((score, index) => {
      return {
        x: mapNum(index, 0, line.length, 0, GRAPH_WIDTH),
        y: mapNum(score, 0, maxScore, GRAPH_HEIGHT, 0),
      };
    });
  }, [line, maxScore]);

  const path = useMemo(() => {
    if (points.length < 2) {
      return null;
    }
    const [first, ...rest] = points;
    let path = `M ${first.x} ${first.y}`;
    rest.forEach((p) => {
      path += ` L ${p.x} ${p.y}`;
    });
    return path;
  }, [points]);

  return (
    <g>
      {path && (
        <path
          d={path}
          className={clsx(
            "fill-none",
            selected ? "stroke-[3]" : "stroke-2",
            dimmed ? "stroke-slate-400" : "stroke-slate-700"
          )}
        />
      )}
      {!dimmed &&
        points.map((p, i) => {
          return <circle key={i} cx={p.x} cy={p.y} r={4} className="fill-slate-400 stroke-1 stroke-slate-900" />;
        })}
    </g>
  );
}

interface GridProps {
  rounds: number;
  maxScore: number;
}

function Grid({ maxScore, rounds }: GridProps) {
  const hLinesCount = Math.floor(maxScore / 100) + 1;
  const ratio = GRAPH_HEIGHT / maxScore;

  return (
    <Fragment>
      {Array.from({ length: rounds }).map((_, i) => {
        const x = (GRAPH_WIDTH / (rounds - 1)) * i;
        return <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={GRAPH_HEIGHT} className="stroke-slate-300" />;
      })}
      {Array.from({ length: hLinesCount }).map((_, i) => {
        const y = GRAPH_HEIGHT - i * 100 * ratio;
        return (
          <Fragment key={`h-${i}`}>
            <text
              x={-GAP - 5}
              y={y}
              className="text-xs fill-slate-700"
              textAnchor="end"
              alignmentBaseline="central"
              width={LEGEND_WIDTH}
            >
              {i * 100}
            </text>
            <line x1={-GAP} y1={y} x2={GRAPH_WIDTH} y2={y} className="stroke-slate-300" />
          </Fragment>
        );
      })}
    </Fragment>
  );
}
