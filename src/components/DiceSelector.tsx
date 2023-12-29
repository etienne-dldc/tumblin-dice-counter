import { Plus } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import clsx from "clsx";
import { DICES, Zone, ZoneResult, useStore } from "../store";
import { tw } from "../utils/functions";
import { Dice } from "./Dice";
import { InlineButton } from "./InlineButton";

type DiceSelectorProps = {
  result: ZoneResult;
  zone: Zone;
};

export function DiceSelector({ result, zone }: DiceSelectorProps): JSX.Element | null {
  const setZoneResult = useStore((state) => state.setZoneResult);

  return (
    <div className="flex flex-col items-stretch gap-4 bg-gray-200 border border-gray-300 p-4 rounded-lg">
      <div>
        <div className="flex flex-row items-center justify-around flex-wrap">
          {DICES.map((dice) => (
            <button
              key={dice.value}
              className="relative group ml-1"
              onClick={(event) => {
                if (zone === "x4") {
                  confetti({
                    origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
                    colors: ["#22c55e", "#16a34a", "#15803d"],
                    startVelocity: 5,
                    decay: 0.95,
                    spread: 360,
                    gravity: 0,
                    ticks: 50,
                  });
                }
                setZoneResult(zone, [...result, dice.value]);
              }}
            >
              <Dice
                weight="duotone"
                dice={dice}
                className={clsx(
                  "h-14 w-14",
                  zone === "malus"
                    ? tw`text-red-500 group-hover:text-red-600`
                    : tw`text-green-500 group-hover:text-green-600`
                )}
              />
              <div
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 -left-0.5 p-0.5 flex items-center justify-center rounded-full",
                  zone === "malus" ? tw`bg-red-500 group-hover:bg-red-600` : tw`bg-green-500 group-hover:bg-green-600`
                )}
              >
                <Plus className={clsx("w-4 h-4 text-white")} weight="bold" />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-stretch rounded-md overflow-hidden divide-x divide-gray-300 border border-gray-300">
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
