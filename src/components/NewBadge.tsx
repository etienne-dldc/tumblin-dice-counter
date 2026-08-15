import clsx from "cnfast";
import { useMemo, type ReactElement } from "react";
import { tw } from "../utils/functions";

const EXPIRY = new Date("2027-02-16T00:00:00Z").getTime();

export function NewBadge(): ReactElement | null {
  const visible = useMemo(() => Date.now() < EXPIRY, []);
  if (!visible) {
    return null;
  }
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
