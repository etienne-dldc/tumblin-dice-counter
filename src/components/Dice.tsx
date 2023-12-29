import { IconWeight } from "phosphor-react";
import { TDice } from "../store";

type DiceProps = {
  dice: TDice;
  className?: string;
  weight?: IconWeight;
};

export function Dice({ dice, className, weight }: DiceProps): JSX.Element | null {
  const { icon: Icon } = dice;
  return <Icon className={className} weight={weight} />;
}
