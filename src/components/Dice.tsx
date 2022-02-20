import { IconWeight } from "phosphor-react";
import React from "react";
import { Dice } from "../store";

type DiceProps = {
  dice: Dice;
  className?: string;
  weight?: IconWeight;
};

export function Dice({ dice, className, weight }: DiceProps): JSX.Element | null {
  const { icon: Icon } = dice;
  return <Icon className={className} weight={weight} />;
}
