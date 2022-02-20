import { Panel } from "../libs/panels";
import { PanelHeader } from "../components/PanelHeader";
import { DICES, useStore, Zone, zoneScore, diceByValue } from "../store";
import React from "react";
import { Dice } from "../components/Dice";

type Props = {
  gameId: string;
  roundIndex: number;
  playerIndex: number;
  zone: Zone;
};

export function ZonePanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/round/${props.roundIndex}/player/${props.playerIndex}/${props.zone}`,
    width: 300,
    content: <Content {...props} />,
  };
}

export function Content({ roundIndex, gameId, playerIndex, zone }: Props): JSX.Element | null {
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
    return result[zone];
  });
  const setZoneResult = useStore((state) => state.setZoneResult);

  if (result === null) {
    return null;
  }

  const score = zoneScore(zone, result);

  return (
    <div className="flex flex-col items-stretch">
      <PanelHeader title={`${zone} (${score} points)`} />
      <div>
        {result.map((value, index) => (
          <span
            key={index}
            onClick={() => {
              const copy = [...result];
              copy.splice(index, 1);
              setZoneResult(copy);
            }}
          >
            <Dice dice={diceByValue(value)} />
          </span>
        ))}
      </div>
      <div>
        {DICES.map((dice) => (
          <button key={dice.value} onClick={() => setZoneResult([...result, dice.value])}>
            <Dice dice={dice} />
          </button>
        ))}
        <button onClick={() => setZoneResult(result.slice(0, result.length - 1))}>Effacer</button>
        <button onClick={() => setZoneResult([])}>Clear</button>
      </div>
    </div>
  );
}
