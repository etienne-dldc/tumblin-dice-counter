import clsx from "cnfast";
import type { ReactElement } from "react";
import { tw } from "../utils/functions";

export function NewBadge(): ReactElement {
  return (
    <span
      className={clsx(
        "text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded inline-flex items-center",
        tw`bg-purple-500 text-white`,
      )}
    >
      New
    </span>
  );
}
