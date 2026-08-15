import { type ReactElement, useState } from "react";
import clsx from "cnfast";
import { BonusStar } from "../components/BonusStar";
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
  const setBonusConfig = useStore((state) => state.setBonusConfig);

  if (bonus === null) {
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
                onChange={(v) => setBonusConfig({ diceCount: v })}
              />
              <NumberInput
                label="Points de bonus"
                value={bonus.bonusPoints}
                min={0}
                onChange={(v) => setBonusConfig({ bonusPoints: v })}
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
  onChange: (value: number) => void;
};

function NumberInput({ label, value, min, onChange }: NumberInputProps): ReactElement {
  const [text, setText] = useState(String(value));

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm uppercase tracking-wide font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        value={text}
        className={clsx("px-3 py-2 rounded-md border bg-white text-base", tw`border-purple-300`)}
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
