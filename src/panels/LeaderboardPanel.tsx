import clsx from "clsx";
import { Trophy } from "phosphor-react";
import { useMemo } from "react";
import { PanelHeader } from "../components/PanelHeader";
import { Panel } from "../libs/panels";
import { playerScore, useStore } from "../store";

type Props = {
  gameId: string;
};

export function LeaderboardPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/leaderboard`,
    width: 450,
    content: <Content {...props} />,
  };
}

function Content({ gameId }: Props) {
  const players = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return [];
    }
    return game.players;
  });

  const game = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game;
  });

  const leaderboard = useMemo(() => {
    if (!game) {
      return [];
    }
    const playersWithScore = players
      .map((player, playerIndex) => {
        return { player, score: playerScore(game, playerIndex, null) };
      })
      .sort((a, b) => b.score - a.score);

    return playersWithScore;
  }, [game, players]);

  return (
    <div className="flex flex-col items-stretch space-y-4 max-h-full">
      <PanelHeader title="Classement" color="red" />
      <div className="flex flex-col items-stretch space-y-4 overflow-y-auto pb-4">
        {leaderboard.map(({ player, score }, index) => {
          const border = ["border-yellow-500", "border-gray-500", "border-orange-900"][index] ?? "";
          const bg = ["bg-yellow-50", "bg-gray-100", "bg-orange-50"][index] ?? "";

          return (
            <div key={index} className={clsx("flex items-center gap-2 px-4 py-2 rounded-md border-2", border, bg)}>
              <span className="text-xl font-bold w-10">{score}</span>
              <span className="text-xl">{player.name}</span>
              <div className="flex-1" />
              <div className="w-12 h-12 flex items-center justify-center">
                {index === 0 ? (
                  <Trophy className="w-full h-full text-yellow-500" weight="duotone" />
                ) : index === 1 ? (
                  <Trophy className="w-full h-full text-gray-500" weight="duotone" />
                ) : index === 2 ? (
                  <Trophy className="w-full h-full text-orange-900" weight="duotone" />
                ) : (
                  <div className="text-2xl font-mono text-gray-500">{index + 1}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
