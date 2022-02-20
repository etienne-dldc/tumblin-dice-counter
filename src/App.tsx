import React, { useMemo } from "react";
import { Panel, Panels, PanelsLayout } from "./libs/panels";
import { SolvePanelsOptions } from "./libs/panels/Panels";
import { mapMaybe } from "./logic/Utils";
import { GamePanel } from "./panels/GamePanel";
import { GamesPanel } from "./panels/GamesPanel";
import { PlayerPanel } from "./panels/PlayerPanel";
import { PlayersPanel } from "./panels/PlayersPanel";
import { RoundPanel } from "./panels/RoundPanel";
import { WelcomePanel } from "./panels/WelcomePanel";
import { ZonePanel } from "./panels/ZonePanel";
import { useStore } from "./store";

type MaybePanels = Array<Panel | null | MaybePanels>;

export function App() {
  const selected = useStore((state) => state.selected);
  const selectGame = useStore((state) => state.selectGame);
  const selectPlayers = useStore((state) => state.selectPlayers);
  const selectRound = useStore((state) => state.selectRound);

  const panels = useMemo((): Panels => {
    const panels: MaybePanels = [
      GamesPanel({ selectedGame: selected === null ? null : selected.gameId, onSelectGame: selectGame }),
      selected
        ? [
            GamePanel({
              gameId: selected.gameId,
              selected: selected.selected,
              onSelectPlayers: selectPlayers,
              onSelectRound: selectRound,
            }),
            mapMaybe(selected.selected, (gameInner): MaybePanels => {
              if (gameInner.type === "players") {
                return [PlayersPanel({ gameId: selected.gameId })];
              }
              if (gameInner.type === "round") {
                return [
                  RoundPanel({
                    gameId: selected.gameId,
                    roundIndex: gameInner.roundIndex,
                    playerIndex: gameInner.selectedPlayer?.playerIndex ?? null,
                  }),
                  mapMaybe(gameInner.selectedPlayer, (selectedPlayer) => [
                    PlayerPanel({
                      gameId: selected.gameId,
                      roundIndex: gameInner.roundIndex,
                      playerIndex: selectedPlayer.playerIndex,
                      selectedZone: selectedPlayer.selectedZone,
                    }),
                    mapMaybe(selectedPlayer.selectedZone, (zone) => [
                      ZonePanel({
                        gameId: selected.gameId,
                        roundIndex: gameInner.roundIndex,
                        playerIndex: selectedPlayer.playerIndex,
                        zone,
                      }),
                    ]),
                  ]),
                ];
              }
              throw new Error("Unknown selected type");
            }),
          ]
        : [WelcomePanel({})],
    ];
    return (panels.flat(Infinity) as Array<Panel | null>).filter((panel): panel is Panel => panel !== null);
  }, [selectGame, selectPlayers, selectRound, selected]);

  const options = useMemo(
    (): SolvePanelsOptions => ({
      space: 10,
    }),
    []
  );

  return <PanelsLayout panels={panels} options={options} />;
}
