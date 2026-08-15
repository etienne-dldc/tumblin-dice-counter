import type { IconWeight } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import type { TDice } from "../store";

type DiceProps = {
  dice: TDice;
  className?: string;
  weight?: IconWeight;
};

export function Dice({ dice, className, weight }: DiceProps): ReactElement | null {
  const { icon: Icon } = dice;
  return <Icon className={className} weight={weight} />;
}
