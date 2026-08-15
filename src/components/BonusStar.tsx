import { Star } from "@phosphor-icons/react";
import clsx from "cnfast";
import type { ReactElement } from "react";
import { tw } from "../utils/functions";

type Props = {
  className?: string;
};

export function BonusStar({ className }: Props): ReactElement {
  return <Star weight="duotone" className={clsx(tw`text-purple-500`, className)} />;
}
