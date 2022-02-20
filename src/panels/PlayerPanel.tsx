import { Panel } from "../libs/panels";
import React from "react";
import { PanelHeader } from "../components/PanelHeader";
import {
  resultScore,
  useStore,
  Zone,
  ZONES,
  zoneScore,
  diceByValue,
  printScore,
  ZoneResult,
  resultSum,
  MULTIPLIER,
  zoneName,
  MULT_SYMBOL,
} from "../store";
import { Dice } from "../components/Dice";
import { ListItem } from "../components/ListItem";
import clsx from "clsx";

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

  if (user === null || result === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch space-y-4">
      <PanelHeader color="red" title={`Tour n°${roundIndex + 1} - ${user.name} (${printScore(resultScore(result))})`} />
      <div className="flex flex-col items-stretch space-y-2">
        {ZONES.map((zone) => (
          <ZoneItem key={zone} zone={zone} result={result[zone]} active={selectedZone === zone} />
        ))}
      </div>
    </div>
  );
}

type ZoneItemProps = {
  active: boolean;
  zone: Zone;
  result: ZoneResult;
};

export function ZoneItem({ active, zone, result }: ZoneItemProps): JSX.Element | null {
  const selectZone = useStore((state) => state.selectZone);

  return (
    <ListItem
      color={zone === "malus" ? "red" : "green"}
      active={active}
      onClick={() => selectZone(zone)}
      className="flex-col items-stretch space-y-2 px-2"
    >
      <div className="flex flex-row items-center">
        <span className="flex-1 text-left px-2 text-lg">{zoneName(zone)}</span>
        {result.length > 0 && (
          <span className="font-normal text-sm">
            {resultSum(result)} {MULT_SYMBOL} {MULTIPLIER[zone]} ={" "}
            <span className="font-bold">{printScore(zoneScore(zone, result))}</span>
          </span>
        )}
      </div>
      {result.length === 0 ? (
        <div className="flex items-center justify-center h-12 rounded-md bg-gray-100">
          <p className="text-center">Aucun dés</p>
        </div>
      ) : (
        <div className="flex justify-center flex-row flex-wrap">
          {result.map((dice, index) => (
            <span key={index}>
              <Dice
                dice={diceByValue(dice)}
                className={clsx("h-12 w-12", zone === "malus" ? "text-red-600" : "text-green-600")}
              />
            </span>
          ))}
        </div>
      )}
    </ListItem>
  );
}
