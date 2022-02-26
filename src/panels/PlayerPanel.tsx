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
  DICES,
  DiceValue,
} from "../store";
import { Dice } from "../components/Dice";
import clsx from "clsx";
import { InlineButton } from "../components/InlineButton";
import { tw } from "../logic/Utils";
import { PlusCircle, Trash } from "phosphor-react";
import useOnclickOutside from "react-cool-onclickoutside";

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
    <div className="h-full flex flex-col items-stretch space-y-4 pb-4">
      <PanelHeader color="red" title={`Tour n°${roundIndex + 1} - ${user.name} (${printScore(resultScore(result))})`} />
      <div className="flex flex-col items-stretch space-y-2 flex-1 overflow-y-auto pb-2">
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
        "flex p-2 rounded-md border-2 flex-col items-stretch space-y-2 px-2",
        active ? colors[color].active : colors[color].base,
        active && "font-bold"
      )}
      onClick={() => selectZone(zone)}
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
        <div className="flex justify-center flex-row flex-wrap select-none">
          {result.map((dice, index) => (
            <DiceItem key={index} dice={dice} index={index} result={result} zone={zone} />
          ))}
        </div>
      )}
    </div>
  );
}

type DiceItemProps = {
  result: ZoneResult;
  zone: Zone;
  index: number;
  dice: DiceValue;
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

type DiceSelectorProps = {
  result: ZoneResult;
  zone: Zone;
};

export function DiceSelector({ result, zone }: DiceSelectorProps): JSX.Element | null {
  const setZoneResult = useStore((state) => state.setZoneResult);

  return (
    <div className="flex flex-col items-stretch space-y-4 my-4 bg-slate-200 border-2 border-slate-300 p-4 rounded-xl shadow-lg">
      <div>
        <div className="flex flex-row items-center justify-around flex-wrap">
          {DICES.map((dice) => (
            <button key={dice.value} className="relative" onClick={() => setZoneResult(zone, [...result, dice.value])}>
              <Dice
                weight="duotone"
                dice={dice}
                className={clsx(
                  "h-14 w-14 ml-2",
                  zone === "malus" ? tw`text-red-500 hover:text-red-600` : tw`text-green-500 hover:text-green-600`
                )}
              />
              <div>
                <PlusCircle
                  className={clsx(
                    "w-5 h-5 absolute left-0 top-[50%] translate-y-[-50%]",
                    zone === "malus" ? "text-red-700" : "text-green-700"
                  )}
                  weight="fill"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-stretch rounded-md overflow-hidden divide-x-2 divide-gray-300 border-2 border-gray-300">
        <InlineButton
          color="blue"
          className="flex-1"
          onClick={() => setZoneResult(zone, result.slice(0, result.length - 1))}
        >
          Annuler
        </InlineButton>
        <InlineButton color="red" className="flex-1" onClick={() => setZoneResult(zone, [])}>
          Tout Effacer
        </InlineButton>
      </div>
    </div>
  );
}
