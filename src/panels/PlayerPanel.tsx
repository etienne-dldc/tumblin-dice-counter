import { Trash } from "@phosphor-icons/react";
import clsx from "cnfast";
import { type ReactElement, useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";
import { BonusStar } from "../components/BonusStar";
import { BountyIcon } from "../components/BountyIcon";
import { Dice } from "../components/Dice";
import { DiceSelector } from "../components/DiceSelector";
import { PanelHeader } from "../components/PanelHeader";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import type { Panel } from "../libs/panels";
import {
  diceByValue,
  getGameProgression,
  printScore,
  resultDiceCount,
  resultScore,
  roundBonus,
  roundBounty,
  type TDiceValue,
  useStore,
  type Zone,
  zoneName,
  type ZoneResult,
  ZONES,
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

export function Content({
  roundIndex,
  gameId,
  playerIndex,
  selectedZone,
}: Props): ReactElement | null {
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
  const bonus = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game.bonus;
  });
  const game = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game;
  });

  if (user === null || result === null || game === null) {
    return null;
  }

  const selectedResult = selectedZone ? result[selectedZone] : null;
  const bonusEnabled = bonus?.enabled === true;
  const bonusDiceCount = bonus ? resultDiceCount(result) : 0;
  const bonusReached =
    bonusEnabled && bonus != null && bonus.diceCount > 0 && bonusDiceCount >= bonus.diceCount;

  const bountyResult = getGameProgression(game).bountyResults[roundIndex];
  const bountyEnabled = game.bounty.enabled;
  const bountyTargetIndex = bountyResult?.targetIndex ?? null;
  const bountyPot = bountyResult?.pot ?? 0;
  const isBountyTarget = bountyEnabled && playerIndex === bountyTargetIndex;
  const targetPlayer =
    bountyEnabled && bountyTargetIndex !== null ? game.players[bountyTargetIndex] : null;

  return (
    <div className="h-full flex flex-col items-stretch gap-4 pb-4">
      <PanelHeader
        color="red"
        title={
          <span className="flex items-center justify-center gap-1">
            {`Tour n°${roundIndex + 1} - ${user.name} `}
            <ScoreBreakdown
              baseScore={resultScore(result)}
              bonusScore={roundBonus(game, result)}
              bountyScore={roundBounty(game, playerIndex, roundIndex)}
            />
          </span>
        }
      />
      {bonusEnabled && bonus != null && (
        <div
          className={clsx(
            "flex items-center justify-between px-3 py-1.5 rounded-md border text-sm",
            bonusReached
              ? tw`bg-purple-200 border-purple-500 text-purple-800`
              : tw`bg-purple-50 border-purple-300 text-purple-700`,
          )}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <BonusStar className="w-4 h-4" />
            Bonus tous les dés
          </span>
          <span>
            {bonusDiceCount} / {bonus.diceCount}
          </span>
          <span className="font-mono font-bold">+{bonusReached ? bonus.bonusPoints : 0}</span>
        </div>
      )}
      {bountyEnabled && targetPlayer && bountyPot > 0 && (
        <div
          className={clsx(
            "flex items-center justify-between px-3 py-1.5 rounded-md border text-sm",
            isBountyTarget
              ? tw`bg-orange-200 border-orange-500 text-orange-800`
              : tw`bg-orange-50 border-orange-300 text-orange-700`,
          )}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <BountyIcon className="w-4 h-4" />
            {isBountyTarget ? "Bounty: en danger" : `Bounty: ${targetPlayer.name}`}
          </span>
          <span className="font-mono font-bold">+{bountyPot}</span>
        </div>
      )}
      <div className="flex flex-col items-stretch gap-2 flex-1 overflow-y-auto pb-2">
        {ZONES.map((zone) => (
          <ZoneItem key={zone} zone={zone} result={result[zone]} active={selectedZone === zone} />
        ))}
      </div>
      {selectedResult && selectedZone && (
        <DiceSelector result={selectedResult} zone={selectedZone} />
      )}
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
  green: {
    base: tw`border-green-200`,
    active: tw`bg-green-200 border-green-600`,
  },
} as const;

export function ZoneItem({ active, zone, result }: ZoneItemProps): ReactElement | null {
  const selectZone = useStore((state) => state.selectZone);

  const color = zone === "malus" ? "red" : "green";

  return (
    <div
      className={clsx(
        "flex p-2 rounded-md border flex-row items-stretch gap-2 px-2",
        active ? colors[color].active : colors[color].base,
        active && "font-bold",
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
        {result.length > 0 && (
          <span className="font-bold">{printScore(zoneScore(zone, result))}</span>
        )}
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

function DiceItem({ result, zone, index, dice }: DiceItemProps): ReactElement | null {
  const [deleting, setDeleting] = useState(false);

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
        className={clsx(
          "h-12 w-12",
          zone === "malus" ? "text-red-600" : "text-green-600",
          deleting && "opacity-50",
        )}
      />
      {deleting && (
        <Trash
          weight="bold"
          className={clsx(
            "absolute left-[50%] top-[50%] -translate-y-1/2 -translate-x-1/2 h-7 w-7",
            zone === "malus" ? "text-red-800" : "text-green-800",
          )}
        />
      )}
    </div>
  );
}
