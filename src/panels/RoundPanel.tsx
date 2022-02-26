import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { playerScore, printScore, resultScore, useStore } from "../store";
import { ListItem } from "../components/ListItem";

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
    <div className="flex flex-col items-stretch space-y-4 max-h-full">
      <PanelHeader title={`Tour n°${roundIndex + 1}`} color="green" />
      <div className="flex flex-col items-stretch space-y-2 overflow-y-auto">
        {players.map((player, index) => {
          const result = results[index] ?? [];
          return (
            <ListItem
              color="green"
              active={index === playerIndex}
              key={index}
              onClick={() => selectPlayer(index)}
              className="items-center"
            >
              <span className="flex-1 text-left">{player.name}</span>
              <div className="font-normal flex flex-col items-end text-xs space-y-1">
                <span>{printScore(resultScore(result))}</span>
                <span>Total: {playerScore(game, index, roundIndex)}</span>
              </div>
            </ListItem>
          );
        })}
      </div>
    </div>
  );
}
