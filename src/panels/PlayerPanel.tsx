import { Trash } from "@phosphor-icons/react";
import clsx from "clsx";
import React from "react";
import useOnclickOutside from "react-cool-onclickoutside";
import { Dice } from "../components/Dice";
import { DiceSelector } from "../components/DiceSelector";
import { PanelHeader } from "../components/PanelHeader";
import { Panel } from "../libs/panels";
import {
  TDiceValue,
  ZONES,
  Zone,
  ZoneResult,
  diceByValue,
  printScore,
  resultScore,
  useStore,
  zoneName,
  zoneScore,
} from "../store";
import { tw } from "../utils/functions";

type Props = {
  gameId: string;
  roundIndex: number;
  playerIndex: number;
  selectedZone: Zone | null;
};

export function PlayerPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/round/${props.roundIndex}/player/${props.playerIndex}`,
    width: 450,
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

  const selectedResult = selectedZone ? result[selectedZone] : null;

  return (
    <div className="h-full flex flex-col items-stretch gap-4 pb-4">
      <PanelHeader color="red" title={`Tour n°${roundIndex + 1} - ${user.name} (${printScore(resultScore(result))})`} />
      <div className="flex flex-col items-stretch gap-2 flex-1 overflow-y-auto pb-2">
        {ZONES.map((zone) => (
          <ZoneItem key={zone} zone={zone} result={result[zone]} active={selectedZone === zone} />
        ))}
      </div>
      {selectedResult && selectedZone && <DiceSelector result={selectedResult} zone={selectedZone} />}
    </div>
  );
}

type ZoneItemProps = {
  active: boolean;
  zone: Zone;
  result: ZoneResult;
};

const colors = {
  red: { base: tw`border-red-200`, active: tw`bg-red-200 border-red-600` },
  green: { base: tw`border-green-200`, active: tw`bg-green-200 border-green-600` },
} as const;

export function ZoneItem({ active, zone, result }: ZoneItemProps): JSX.Element | null {
  const selectZone = useStore((state) => state.selectZone);

  const color = zone === "malus" ? "red" : "green";

  return (
    <div
      className={clsx(
        "flex p-2 rounded-md border flex-row items-stretch gap-2 px-2",
        active ? colors[color].active : colors[color].base,
        active && "font-bold"
      )}
      onClick={() => selectZone(zone)}
    >
      <div className="flex items-center justify-center w-10">
        <span className="flex-1 text-left px-2 text-lg">{zoneName(zone)}</span>
      </div>
      {result.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-12 rounded-md bg-gray-900/5">
          <p className="text-center">Aucun dés</p>
        </div>
      ) : (
        <div className="flex-1 flex justify-center flex-row flex-wrap select-none">
          {result.map((dice, index) => (
            <DiceItem key={index} dice={dice} index={index} result={result} zone={zone} />
          ))}
        </div>
      )}
      <div className="flex w-10 flex-row items-center justify-end pr-2">
        {result.length > 0 && <span className="font-bold">{printScore(zoneScore(zone, result))}</span>}
      </div>
    </div>
  );
}

type DiceItemProps = {
  result: ZoneResult;
  zone: Zone;
  index: number;
  dice: TDiceValue;
};

function DiceItem({ result, zone, index, dice }: DiceItemProps): JSX.Element | null {
  const [deleting, setDeleting] = React.useState(false);

  const setZoneResult = useStore((state) => state.setZoneResult);
  const ref = useOnclickOutside(() => {
    setDeleting(false);
  });

  return (
    <div
      className="cursor-pointer relative"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!deleting) {
          setDeleting(true);
          return;
        }
        const copy = [...result];
        copy.splice(index, 1);
        setZoneResult(zone, copy);
        setDeleting(false);
      }}
      ref={ref}
    >
      <Dice
        dice={diceByValue(dice)}
        className={clsx("h-12 w-12", zone === "malus" ? "text-red-600" : "text-green-600", deleting && "opacity-50")}
      />
      {deleting && (
        <Trash
          weight="bold"
          className={clsx(
            "absolute left-[50%] top-[50%] -translate-y-1/2 -translate-x-1/2 h-7 w-7",
            zone === "malus" ? "text-red-800" : "text-green-800"
          )}
        />
      )}
    </div>
  );
}
