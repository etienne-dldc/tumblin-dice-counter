import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { playerScore, resultScore, useStore } from "../store";
import clsx from "clsx";

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

export function Content({ roundIndex, gameId, playerIndex }: Props): JSX.Element | null {
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

  const selectPlayer = useStore((state) => state.selectPlayer);

  if (game === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch">
      <PanelHeader title={`Tour n°${roundIndex + 1}`} />
      <div className="flex flex-col items-stretch">
        {players.map((player, index) => {
          const result = results[index] ?? [];
          return (
            <button
              key={index}
              onClick={() => selectPlayer(index)}
              className={clsx(index === playerIndex && "font-bold")}
            >
              {player.name} (+{resultScore(result)} points) Total: {playerScore(game, index, roundIndex)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
