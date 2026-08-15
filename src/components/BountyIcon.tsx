import { CrosshairSimple } from "@phosphor-icons/react";
import clsx from "cnfast";
import type { ReactElement } from "react";
import { tw } from "../utils/functions";

type Props = {
  className?: string;
};

export function BountyIcon({ className }: Props): ReactElement {
  return <CrosshairSimple weight="duotone" className={clsx(tw`text-orange-500`, className)} />;
}
