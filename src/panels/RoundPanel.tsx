import { useMemo, type ReactElement } from "react";
import clsx from "cnfast";
import { BountyIcon } from "../components/BountyIcon";
import { ListItem } from "../components/ListItem";
import { PanelHeader } from "../components/PanelHeader";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import type { Panel } from "../libs/panels";
import {
  getGameProgression,
  playerScore,
  resultScore,
  roundBonus,
  roundBounty,
  useStore,
} from "../store";
import { tw } from "../utils/functions";

type Props = {
  gameId: string;
  roundIndex: number;
  playerIndex: number | null;
};

export function RoundPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/round/${props.roundIndex}`,
    width: 300,
    content: <Content {...props} />,
  };
}

export function Content({ roundIndex, gameId, playerIndex }: Props): ReactElement | null {
  const players = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return [];
    }
    return game.players;
  });
  const results = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return [];
    }
    const round = game.rounds[roundIndex];
    if (!round) {
      return [];
    }
    return round.results;
  });
  const game = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game;
  });

  const firstPlayer = useMemo(() => {
    return players[roundIndex % players.length];
  }, [players, roundIndex]);

  const selectPlayer = useStore((state) => state.selectPlayer);

  if (game === null) {
    return null;
  }

  const bountyResult = getGameProgression(game).bountyResults[roundIndex];
  const bountyTargetIndex = bountyResult?.targetIndex ?? null;
  const bountyPot = bountyResult?.pot ?? 0;
  const bountyEnabled = game.bounty.enabled;
  const targetPlayer =
    bountyEnabled && bountyTargetIndex !== null ? players[bountyTargetIndex] : null;

  return (
    <div className="flex flex-col items-stretch gap-4 max-h-full">
      <PanelHeader title={`Tour n°${roundIndex + 1}`} color="green" />
      <div className="flex flex-col items-stretch gap-2 overflow-y-auto">
        <h3 className="text-sm uppercase tracking-wide px-1">
          Premier joueur: <span className="font-bold">{firstPlayer.name}</span>
        </h3>
        {bountyEnabled && targetPlayer && bountyPot > 0 && (
          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm",
              tw`bg-orange-50 border-orange-300 text-orange-700`,
            )}
          >
            <BountyIcon className="w-4 h-4" />
            <span className="font-semibold">
              Bounty: {targetPlayer.name} +{bountyPot}
            </span>
          </div>
        )}
        {players.map((player, index) => {
          const result = results[index] ?? [];
          const isBountyTarget = bountyEnabled && index === bountyTargetIndex;
          return (
            <ListItem
              color="green"
              active={index === playerIndex}
              key={index}
              onClick={() => selectPlayer(index)}
              className="items-center"
            >
              <span className="flex-1 text-left flex items-center gap-1">
                {player.name}
                {isBountyTarget && <BountyIcon className="w-4 h-4 shrink-0" />}
              </span>
              <div className="font-normal flex flex-col items-end text-xs gap-1">
                <ScoreBreakdown
                  baseScore={resultScore(result)}
                  bonusScore={roundBonus(game, result)}
                  bountyScore={roundBounty(game, index, roundIndex)}
                />
                <span>Total: {playerScore(game, index, roundIndex)}</span>
              </div>
            </ListItem>
          );
        })}
      </div>
    </div>
  );
}
