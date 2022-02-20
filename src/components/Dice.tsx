import React from "react";
import { Dice } from "../store";

type DiceProps = {
  dice: Dice;
  className?: string;
};

export function Dice({ dice, className }: DiceProps): JSX.Element | null {
  const { icon: Icon } = dice;
  return <Icon className={className} />;
}
