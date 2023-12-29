import { Trophy } from "@phosphor-icons/react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Chart } from "../components/Chart";
import { PanelHeader } from "../components/PanelHeader";
import { Panel } from "../libs/panels";
import { playerScore, resultScore, useStore } from "../store";
import { tw } from "../utils/functions";

type Props = {
  gameId: string;
};

export function LeaderboardPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/leaderboard`,
    width: 800,
    content: <Content {...props} />,
  };
}

function Content({ gameId }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

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
        return { player, score: playerScore(game, playerIndex, null), playerIndex };
      })
      .sort((a, b) => b.score - a.score);

    return playersWithScore;
  }, [game, players]);

  const chartData = useMemo((): number[][] => {
    if (!game) {
      return [];
    }
    const data = game.players.map(() => [0]);
    game.rounds.forEach((round) => {
      round.results.forEach((result, index) => {
        const arr = data[index];
        arr.push(arr[arr.length - 1] + resultScore(result));
      });
    });
    return data;
  }, [game]);

  return (
    <div className="flex flex-col items-stretch gap-4 max-h-full">
      <PanelHeader title="Classement" color="red" />
      <div className="flex flex-col items-stretch gap-4 overflow-y-auto pb-4">
        <Chart data={chartData} selected={selected} />
        <div className="flex flex-col items-stretch gap-2">
          {leaderboard.map(({ player, score, playerIndex }, index) => {
            const isSelected = playerIndex === selected;
            const positionStylesMap = {
              // first place
              first: {
                base: tw`border-yellow-500 bg-yellow-50`,
                selected: tw`border-yellow-500 bg-yellow-200`,
                unselected: tw`border-yellow-500 bg-yellow-50 opacity-50`,
              },
              // second place
              second: {
                base: tw`border-gray-500 bg-gray-100`,
                selected: tw`border-gray-500 bg-gray-300`,
                unselected: tw`border-gray-500 bg-gray-100 opacity-50`,
              },
              // third place
              third: {
                base: tw`border-orange-900 bg-orange-50`,
                selected: tw`border-orange-900 bg-orange-300`,
                unselected: tw`border-orange-900 bg-orange-50 opacity-50`,
              },
              rest: {
                base: tw`border-gray-300 bg-gray-50`,
                selected: tw`bg-gray-200 border-gray-400`,
                unselected: tw`opacity-50`,
              },
            };

            const positionStyles =
              [positionStylesMap.first, positionStylesMap.second, positionStylesMap.third][index] ??
              positionStylesMap.rest;

            return (
              <div
                key={index}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-md border",
                  isSelected
                    ? positionStyles.selected
                    : selected === null
                    ? positionStyles.base
                    : positionStyles.unselected
                )}
                onClick={() => setSelected((p) => (p === playerIndex ? null : playerIndex))}
              >
                <span className="text-xl font-bold w-14 font-mono text-right">{score}</span>
                <span className="text-xl">{player.name}</span>
                <div className="flex-1" />
                <div className="w-8 h-8 flex items-center justify-center">
                  {index === 0 ? (
                    <Trophy className="w-full h-full text-yellow-500" weight="duotone" />
                  ) : index === 1 ? (
                    <Trophy className="w-full h-full text-gray-500" weight="duotone" />
                  ) : index === 2 ? (
                    <Trophy className="w-full h-full text-orange-900" weight="duotone" />
                  ) : (
                    <div className="w-full h-full rounded-full border-[3px] border-gray-300 bg-gray-50 flex items-center justify-center">
                      <span className="text-xl font-mono text-gray-500">{index + 1}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
