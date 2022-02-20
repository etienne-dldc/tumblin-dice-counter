import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { GameSelected, useStore } from "../store";
import { InlineButton } from "../components/InlineButton";
import { ListItem } from "../components/ListItem";
import { Button } from "../components/Button";

type Props = {
  gameId: string;
  selected: GameSelected;
  onSelectPlayers: () => void;
  onSelectRound: (roundIndex: number) => void;
};

export function GamePanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}`,
    width: 500,
    content: <Content {...props} />,
  };
}

export function Content({ gameId, selected, onSelectPlayers, onSelectRound }: Props): JSX.Element | null {
  const game = useStore((state) => state.games.find((g) => g.id === gameId));
  const renameGame = useStore((state) => state.renameGame);
  const removeGame = useStore((state) => state.removeGame);
  const addRound = useStore((state) => state.addRound);

  const playersActive = selected?.type === "players";
  const activeRound = selected?.type === "round" ? selected.roundIndex : null;

  if (!game) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch space-y-4">
      <PanelHeader title={game.name} color="pink" />
      <div className="flex flex-row items-center rounded-md overflow-hidden divide-x-2 divide-gray-300 border-2 border-gray-300">
        <InlineButton
          color="green"
          className="flex-1"
          onClick={() => {
            const res = window.prompt(`Entre game Name`, game.name);
            if (res) {
              renameGame(res);
            }
          }}
        >
          Renommer
        </InlineButton>
        <InlineButton
          color="red"
          className="flex-1"
          onClick={() => {
            const res = window.confirm(`Supprimer cette partie ?`);
            if (res) {
              removeGame();
            }
          }}
        >
          Supprimer
        </InlineButton>
      </div>
      <ListItem active={playersActive} color="pink" className="" onClick={onSelectPlayers}>
        {game.players.length === 0
          ? "Ajouter des joueurs"
          : game.players.length === 1
          ? "1 joueur"
          : `${game.players.length} joueurs`}
      </ListItem>
      <div className="flex flex-col items-stretch space-y-2">
        <h3 className="text-sm uppercase tracking-wide font-semibold px-1">Tours de jeux</h3>
        {game.rounds.length === 0 ? (
          <p className="py-4 text-center bg-gray-100 rounded-md">Aucun tour de jeu</p>
        ) : (
          game.rounds.map((round, index) => (
            <ListItem color="pink" active={activeRound === index} key={index} onClick={() => onSelectRound(index)}>
              Tour n°{index + 1}
            </ListItem>
          ))
        )}
      </div>
      <Button color="pink" className="self-center" onClick={() => addRound()}>
        Nouveau tour
      </Button>
    </div>
  );
}
