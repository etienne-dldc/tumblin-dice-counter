import clsx from "cnfast";
import type { ReactElement } from "react";
import { tw } from "../utils/functions";

const colors = {
  indigo: {
    base: tw`border-indigo-200`,
    active: tw`bg-indigo-200 border-indigo-600`,
  },
  blue: { base: tw`border-blue-200`, active: tw`bg-blue-200 border-blue-600` },
  red: { base: tw`border-red-200`, active: tw`bg-red-200 border-red-600` },
  green: {
    base: tw`border-green-200`,
    active: tw`bg-green-200 border-green-600`,
  },
  teal: { base: tw`border-teal-200`, active: tw`bg-teal-200 border-teal-600` },
  pink: { base: tw`border-pink-200`, active: tw`bg-pink-200 border-pink-600` },
  purple: { base: tw`border-purple-200`, active: tw`bg-purple-200 border-purple-600` },
  orange: { base: tw`border-orange-200`, active: tw`bg-orange-200 border-orange-600` },
} as const;

type ListItemProps = {
  className?: string;
  active: boolean;
  color: keyof typeof colors;
  children: React.ReactNode;
  onClick?: () => void;
};

export function ListItem({
  color,
  active,
  children,
  className,
  onClick,
}: ListItemProps): ReactElement | null {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex p-2 px-4 rounded-md border",
        className,
        active ? colors[color].active : colors[color].base,
        active && "font-bold",
      )}
    >
      {children}
    </button>
  );
}
