import { type ReactElement, useState } from "react";
import clsx from "cnfast";
import { BonusStar } from "../components/BonusStar";
import { BountyIcon } from "../components/BountyIcon";
import { NewBadge } from "../components/NewBadge";
import { PanelHeader } from "../components/PanelHeader";
import type { Panel } from "../libs/panels";
import { useStore } from "../store";
import { tw } from "../utils/functions";

type Props = {
  gameId: string;
};

export function SettingsPanel(props: Props): Panel {
  return {
    key: `game/${props.gameId}/settings`,
    width: 400,
    content: <Content {...props} />,
  };
}

export function Content({ gameId }: Props): ReactElement | null {
  const bonus = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game.bonus;
  });
  const bounty = useStore((state) => {
    const game = state.games.find((game) => game.id === gameId);
    if (!game) {
      return null;
    }
    return game.bounty;
  });
  const setBonusConfig = useStore((state) => state.setBonusConfig);
  const setBountyConfig = useStore((state) => state.setBountyConfig);

  if (bonus === null || bounty === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-4 max-h-full">
      <PanelHeader title="Réglages" color="purple" />
      <div className="flex flex-col items-stretch gap-4 overflow-y-auto pb-4">
        <div
          className={clsx(
            "flex flex-col gap-3 p-4 rounded-md border",
            tw`bg-purple-50 border-purple-200`,
          )}
        >
          <div className="flex flex-row items-center gap-2">
            <BonusStar className="w-5 h-5" />
            <input
              id="bonus-enabled"
              type="checkbox"
              checked={bonus.enabled}
              onChange={(e) => setBonusConfig({ enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="bonus-enabled" className="text-lg font-semibold">
              Bonus tous les dés
            </label>
            <NewBadge />
          </div>
          <p className="text-sm text-gray-600">
            Si activé, un joueur qui place tous ses dés sur le plateau (hors zone malus) lors d'un
            tour reçoit les points de bonus.
          </p>
          {bonus.enabled && (
            <div className={clsx("flex flex-col gap-3 pt-2 border-t", tw`border-purple-200`)}>
              <NumberInput
                label="Nombre de dés par équipe"
                value={bonus.diceCount}
                min={1}
                color="purple"
                onChange={(v) => setBonusConfig({ diceCount: v })}
              />
              <NumberInput
                label="Points de bonus"
                value={bonus.bonusPoints}
                min={0}
                color="purple"
                onChange={(v) => setBonusConfig({ bonusPoints: v })}
              />
            </div>
          )}
        </div>
        <div
          className={clsx(
            "flex flex-col gap-3 p-4 rounded-md border",
            tw`bg-orange-50 border-orange-200`,
          )}
        >
          <div className="flex flex-row items-center gap-2">
            <BountyIcon className="w-5 h-5" />
            <input
              id="bounty-enabled"
              type="checkbox"
              checked={bounty.enabled}
              onChange={(e) => setBountyConfig({ enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="bounty-enabled" className="text-lg font-semibold">
              Bounty
            </label>
            <NewBadge />
          </div>
          <p className="text-sm text-gray-600">
            Si activé, le joueur en tête a une prime sur sa tête. Celui qui le dépasse au score du
            tour récupère la prime (partagée si plusieurs). La prime grossit de {bounty.amount}{" "}
            points chaque tour où il reste en tête.
          </p>
          {bounty.enabled && (
            <div className={clsx("flex flex-col gap-3 pt-2 border-t", tw`border-orange-200`)}>
              <NumberInput
                label="Montant par tour"
                value={bounty.amount}
                min={0}
                color="orange"
                onChange={(v) => setBountyConfig({ amount: v })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type NumberInputProps = {
  label: string;
  value: number;
  min: number;
  color: "purple" | "orange";
  onChange: (value: number) => void;
};

const inputColors = {
  purple: tw`border-purple-300`,
  orange: tw`border-orange-300`,
} as const;

function NumberInput({ label, value, min, color, onChange }: NumberInputProps): ReactElement {
  const [text, setText] = useState(String(value));

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm uppercase tracking-wide font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        value={text}
        className={clsx("px-3 py-2 rounded-md border bg-white text-base", inputColors[color])}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = Number(e.target.value);
          if (Number.isNaN(parsed) || parsed < min) {
            return;
          }
          onChange(parsed);
        }}
      />
    </label>
  );
}
