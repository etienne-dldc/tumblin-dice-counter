import clsx from "clsx";
import React from "react";
import { tw } from "../utils/functions";

const colors = {
  indigo: tw`bg-gray-100 hover:bg-indigo-500`,
  red: tw`bg-gray-100 hover:bg-red-500`,
  green: tw`bg-gray-100 hover:bg-green-500`,
  blue: tw`bg-gray-100 hover:bg-blue-500`,
} as const;

type InlineButtonProps = {
  small?: boolean;
  className?: string;
  color?: keyof typeof colors;
  children: React.ReactNode;
  onClick?: () => void;
};

export function InlineButton({
  color = "indigo",
  className,
  children,
  onClick,
  small = false,
}: InlineButtonProps): JSX.Element | null {
  return (
    <button
      className={clsx(
        small ? tw`text-xs px-2 py-1` : tw`text-sm px-3 py-2.5`,
        tw`tracking-wide font-semibold uppercase text-black hover:text-white`,
        className,
        colors[color]
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
