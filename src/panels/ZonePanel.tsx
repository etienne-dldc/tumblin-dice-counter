import { Panel } from "../libs/panels";
import { PanelHeader } from "../components/PanelHeader";
import { DICES, useStore, Zone, zoneScore, diceByValue, zoneName } from "../store";
import React from "react";
import { Dice } from "../components/Dice";
import { InlineButton } from "../components/InlineButton";
import clsx from "clsx";

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
    <div className="flex flex-col items-stretch space-y-4">
      <PanelHeader title={`${zoneName(zone)} (${score})`} />
      {result.length === 0 ? (
        <div className="flex items-center justify-center h-12 rounded-md bg-gray-100">
          <p className="text-center">Aucun dés</p>
        </div>
      ) : (
        <div className="flex justify-center flex-row flex-wrap">
          {result.map((dice, index) => (
            <div
              key={index}
              onClick={() => {
                const copy = [...result];
                copy.splice(index, 1);
                setZoneResult(copy);
              }}
            >
              <Dice
                dice={diceByValue(dice)}
                className={clsx("h-16 w-16", zone === "malus" ? "text-red-600" : "text-green-600")}
              />
            </div>
          ))}
        </div>
      )}
      <div>
        <div className="flex flex-row items-center justify-center">
          {DICES.slice(0, 3).map((dice) => (
            <button key={dice.value} onClick={() => setZoneResult([...result, dice.value])}>
              <Dice weight="duotone" dice={dice} className="h-24 w-24 text-blue-500 hover:text-blue-600" />
            </button>
          ))}
        </div>
        <div className="flex flex-row items-center justify-center">
          {DICES.slice(3).map((dice) => (
            <button key={dice.value} onClick={() => setZoneResult([...result, dice.value])}>
              <Dice weight="duotone" dice={dice} className="h-24 w-24 text-blue-500 hover:text-blue-600" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-center rounded-md overflow-hidden divide-x-2 divide-gray-300 border-2 border-gray-300">
        <InlineButton color="blue" className="flex-1" onClick={() => setZoneResult(result.slice(0, result.length - 1))}>
          Annuler
        </InlineButton>
        <InlineButton color="red" className="flex-1" onClick={() => setZoneResult([])}>
          Tout Effacer
        </InlineButton>
      </div>
    </div>
  );
}
