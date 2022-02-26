import { Panel, useLayoutInfosOrThrow } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { useStore } from "../store";
import { ListItem } from "../components/ListItem";
import { Button } from "../components/Button";

type Props = {
  selectedGame: null | string;
};

export function GamesPanel(props: Props): Panel {
  return {
    key: "games",
    width: 400,
    content: <Content {...props} />,
  };
}

export function Content({ selectedGame }: Props): JSX.Element | null {
  const games = useStore((state) => state.games);
  const addGame = useStore((state) => state.addGame);
  const selectHome = useStore((state) => state.selectHome);
  const selectGame = useStore((state) => state.selectGame);
  const nav = useLayoutInfosOrThrow();

  return (
    <div className="flex flex-col items-stretch space-y-4">
      <PanelHeader title="Tumblin Dice" onHeaderClick={selectHome} />
      <div className="flex flex-col items-stretch space-y-2">
        {games.map((game) => (
          <ListItem
            key={game.id}
            active={game.id === selectedGame}
            onClick={() => {
              if (game.id !== selectedGame) {
                selectGame(game.id);
                return;
              }
              if (nav.showChildren) {
                nav.showChildren();
              }
            }}
            color="indigo"
          >
            <span className="text-lg">{game.name}</span>
          </ListItem>
        ))}
      </div>
      <Button onClick={addGame} className="self-center">
        Nouvelle Partie
      </Button>
    </div>
  );
}
