import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import { resultScore, useStore, Zone, ZONES, zoneScore, diceByValue } from "../store";
import clsx from "clsx";
import { Dice } from "../components/Dice";

type Props = {
  gameId: string;
  roundIndex: number;
  playerIndex: number;
  selectedZone: Zone | null;
};

export function PlayerPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/round/${props.roundIndex}/player/${props.playerIndex}`,
    width: 300,
    content: <Content {...props} />,
  };
}

export function Content({ roundIndex, gameId, playerIndex, selectedZone }: Props): JSX.Element | null {
  const user = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game.players[playerIndex] ?? null;
  });
  const result = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    const round = game.rounds[roundIndex];
    if (!round) {
      return null;
    }
    const result = round.results[playerIndex];
    if (!result) {
      return null;
    }
    return result;
  });
  const selectZone = useStore((state) => state.selectZone);

  if (user === null || result === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch">
      <PanelHeader title={`Round ${roundIndex + 1} - ${user.name} (${resultScore(result)} points)`} />
      <div className="flex flex-col items-stretch">
        {ZONES.map((zone) => (
          <button key={zone} onClick={() => selectZone(zone)} className={clsx(selectedZone === zone && "font-bold")}>
            {zone} ({zoneScore(zone, result[zone])} points)
            <div>
              {result[zone].map((dice, index) => (
                <span key={index}>
                  <Dice dice={diceByValue(dice)} />
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
