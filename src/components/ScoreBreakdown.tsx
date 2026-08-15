import clsx from "cnfast";
import type { ReactElement } from "react";
import { BonusStar } from "./BonusStar";
import { BountyIcon } from "./BountyIcon";
import { tw } from "../utils/functions";

type Props = {
  baseScore: number;
  bonusScore: number;
  bountyScore: number;
};

function printScore(score: number): string {
  return score > 0 ? "+" + score : score.toFixed(0);
}

export function ScoreBreakdown({ baseScore, bonusScore, bountyScore }: Props): ReactElement {
  return (
    <span className="flex items-center gap-1">
      <span>{printScore(baseScore)}</span>
      {bonusScore > 0 && (
        <span className={clsx("flex items-center gap-0.5", tw`text-purple-600`)}>
          {printScore(bonusScore)}
          <BonusStar className="w-3.5 h-3.5" />
        </span>
      )}
      {bountyScore !== 0 && (
        <span className={clsx("flex items-center gap-0.5", tw`text-orange-600`)}>
          {printScore(bountyScore)}
          <BountyIcon className="w-3.5 h-3.5" />
        </span>
      )}
    </span>
  );
}
