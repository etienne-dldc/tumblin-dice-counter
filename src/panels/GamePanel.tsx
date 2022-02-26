import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { GameSelected, playerScore, printScore, resultScore, useStore } from "../store";
import { ListItem } from "../components/ListItem";
import { Button } from "../components/Button";
import { Pencil, Trash } from "phosphor-react";

type Props = {
  gameId: string;
  selected: GameSelected;
};

export function GamePanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}`,
    width: 600,
    flex: 1,
    content: <Content {...props} />,
  };
}

export function Content({ gameId, selected }: Props): JSX.Element | null {
  const game = useStore((state) => state.games.find((g) => g.id === gameId));
  const renameGame = useStore((state) => state.renameGame);
  const removeGame = useStore((state) => state.removeGame);
  const addRound = useStore((state) => state.addRound);
  const selectPlayers = useStore((state) => state.selectPlayers);
  const selectRound = useStore((state) => state.selectRound);

  const playersActive = selected?.type === "players";
  const activeRound = selected?.type === "round" ? selected.roundIndex : null;

  if (!game) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch space-y-4 max-h-full">
      <PanelHeader
        title={
          <div className="flex flex-row items-center justify-center space-x-4">
            <span>{game.name}</span>
            <button
              className="text-blue-500 rounded-md bg-blue-100 border-2 border-blue-200 p-1 hover:bg-blue-600 hover:text-white hover:border-blue-700"
              onClick={() => {
                const res = window.prompt(`Nom de la partie:`, game.name);
                if (res) {
                  renameGame(res);
                }
              }}
            >
              <Pencil className="w-6 h-6 text-inherit" />
            </button>
            <button
              className="text-red-500 rounded-md bg-red-100 border-2 border-red-200 p-1 hover:bg-red-600 hover:text-white hover:border-red-700"
              onClick={() => {
                const res = window.confirm(`Supprimer cette partie ?`);
                if (res) {
                  removeGame();
                }
              }}
            >
              <Trash className="w-6 h-6 text-inherit" />
            </button>
          </div>
        }
        color="pink"
      />
      <div className="flex flex-col items-stretch space-y-4 overflow-auto pb-4">
        <ListItem active={playersActive} color="pink" className="" onClick={selectPlayers}>
          {game.players.length === 0
            ? "Ajouter des joueurs"
            : game.players.length === 1
            ? "1 joueur"
            : `${game.players.length} joueurs`}
        </ListItem>
        <div className="flex flex-col items-stretch space-y-2">
          <h3 className="text-sm uppercase tracking-wide font-semibold px-1">Tours de jeux</h3>

          <div className="overflow-x-auto">
            {game.rounds.length === 0 ? (
              <p className="py-4 text-center bg-gray-100 rounded-md">Aucun tour de jeu</p>
            ) : (
              <div className="space-y-2 min-h-full">
                <div className="px-4 border-2 border-transparent">
                  <Line
                    values={game.players.map((p) => (
                      <p className="text-right text-ellipsis w-32 whitespace-nowrap overflow-hidden">{p.name}</p>
                    ))}
                  />
                </div>
                {game.rounds.map((round, index) => (
                  <ListItem
                    color="pink"
                    className="min-w-full"
                    active={activeRound === index}
                    key={index}
                    onClick={() => selectRound(index)}
                  >
                    <Line
                      name={`Tour n°${index + 1}`}
                      values={round.results.map((result) => (
                        <p className="text-right">{printScore(resultScore(result))}</p>
                      ))}
                    />
                  </ListItem>
                ))}
                <div className="px-4 border-2 border-transparent">
                  <Line
                    name="Total"
                    values={game.players.map((_p, playerIndex) => (
                      <p className="text-right font-bold">{playerScore(game, playerIndex, null)}</p>
                    ))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Button color="pink" className="self-center" onClick={() => addRound()}>
          Nouveau tour
        </Button>
      </div>
    </div>
  );
}

type LineProps = {
  name?: string;
  values: Array<React.ReactElement>;
};

function Line({ name, values }: LineProps): JSX.Element {
  return (
    <div className="flex flex-row items-center text-left tracking-normal space-x-4">
      <div className="w-24 shrink-0">
        {name && <p className="text-sm uppercase tracking-wide font-semibold">{name}</p>}
      </div>
      {values.map((content, index) => (
        <div key={index} className="w-32 shrink-0 overflow-hidden text-ellipsis">
          {content}
        </div>
      ))}
    </div>
  );
}
