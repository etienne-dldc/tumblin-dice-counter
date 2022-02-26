import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { useStore, Player } from "../store";
import { Button } from "../components/Button";
import { InlineButton } from "../components/InlineButton";

type Props = {
  gameId: string;
};

export function PlayersPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/players`,
    width: 400,
    content: <Content {...props} />,
  };
}

export function Content({ gameId }: Props): JSX.Element | null {
  const players = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return [];
    }
    return game.players;
  });
  const addPlayer = useStore((state) => state.addPlayer);

  return (
    <div className="flex flex-col items-stretch space-y-4">
      <PanelHeader title="Joueurs" color="teal" />
      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="py-4 text-center bg-gray-100 rounded-md">Aucun joueurs</p>
        ) : (
          players.map((player, index) => <PlayerDetails key={index} player={player} playerIndex={index} />)
        )}
      </div>
      <Button
        color="teal"
        className="self-center"
        onClick={() => {
          const name = prompt("Nom du joueur");
          if (name) {
            addPlayer(name);
          }
        }}
      >
        Ajouter un joueur
      </Button>
    </div>
  );
}

type PlayerDetailsProps = {
  player: Player;
  playerIndex: number;
};

export function PlayerDetails({ player, playerIndex }: PlayerDetailsProps): JSX.Element | null {
  const renamePlayer = useStore((state) => state.renamePlayer);
  const removePlayer = useStore((state) => state.removePlayer);

  return (
    <div className="flex flex-row items-center space-x-2 bg-teal-50 p-2 border border-teal-400 rounded">
      <span className="flex-1 text-lg pl-2">{player.name}</span>
      <div className="flex flex-row items-center rounded overflow-hidden divide-x divide-gray-300 border border-gray-300">
        <InlineButton
          color="green"
          className="flex-1"
          small
          onClick={() => {
            const name = prompt("Nom du joueur:", player.name);
            if (name) {
              renamePlayer(playerIndex, name);
            }
          }}
        >
          Renommer
        </InlineButton>
        {/* <InlineButton
          onClick={() => {
            alert("TODO");
          }}
        >
          Changer la couleur
        </InlineButton> */}
        <InlineButton
          color="red"
          className="flex-1"
          small
          onClick={() => {
            if (confirm("Supprimer ce joueur ?")) {
              removePlayer(playerIndex);
            }
          }}
        >
          Supprimer
        </InlineButton>
      </div>
    </div>
  );
}
