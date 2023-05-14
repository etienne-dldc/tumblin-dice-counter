import { Pencil, Plus, Trash } from "phosphor-react";
import { Fragment, useMemo } from "react";
import { Button } from "../components/Button";
import { PanelHeader } from "../components/PanelHeader";
import { Panel } from "../libs/panels";
import { Player, useStore } from "../store";

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

  const games = useStore((state) => state.games);

  const otherPlayers = useMemo(() => {
    const result: string[] = [];
    for (const game of games) {
      for (const player of game.players) {
        if (!result.includes(player.name) && !players.find((p) => p.name === player.name)) {
          result.push(player.name);
        }
      }
    }
    return result;
  }, [games, players]);

  return (
    <div className="flex flex-col items-stretch space-y-4 max-h-full">
      <PanelHeader title="Joueurs" color="teal" />
      <div className="flex flex-col items-stretch space-y-4 overflow-y-auto pb-4">
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
        {otherPlayers.length > 0 && (
          <Fragment>
            <h3 className="text-sm uppercase tracking-wide font-semibold px-1">Joueurs des parties précédantes</h3>
            {otherPlayers.map((playerName, index) => (
              <div
                key={index}
                className="flex flex-row items-center space-x-2 bg-teal-50 p-2 border-2 border-teal-200 rounded cursor-pointer"
                onClick={() => addPlayer(playerName)}
              >
                <Plus className="w-5 h-5 text-teal-600" weight="bold" />
                <span className="flex-1 text-base pl-2">{playerName}</span>
              </div>
            ))}
          </Fragment>
        )}
      </div>
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
    <div className="flex flex-row items-center space-x-2 bg-teal-50 p-2 border-2 border-teal-400 rounded">
      <span className="flex-1 text-lg pl-2">{player.name}</span>
      <div className="flex flex-row items-center rounded overflow-hidden space-x-2">
        <button
          className="text-blue-500 rounded-md bg-blue-100 border-2 border-blue-200 p-1 hover:bg-blue-600 hover:text-white hover:border-blue-700"
          onClick={() => {
            const name = prompt("Nom du joueur:", player.name);
            if (name) {
              renamePlayer(playerIndex, name);
            }
          }}
        >
          <Pencil className="w-6 h-6 text-inherit" />
        </button>
        <button
          className="text-red-500 rounded-md bg-red-100 border-2 border-red-200 p-1 hover:bg-red-600 hover:text-white hover:border-red-700"
          onClick={() => {
            if (confirm("Supprimer ce joueur ?")) {
              removePlayer(playerIndex);
            }
          }}
        >
          <Trash className="w-6 h-6 text-inherit" />
        </button>
      </div>
    </div>
  );
}
