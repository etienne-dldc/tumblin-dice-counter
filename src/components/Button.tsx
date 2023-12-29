import clsx from "clsx";
import React from "react";
import { tw } from "../utils/functions";

const colors = {
  indigo: tw`bg-indigo-500 border-indigo-600 hover:bg-indigo-600  hover:border-indigo-700`,
  red: tw`bg-red-500 border-red-600 hover:bg-red-600  hover:border-red-700`,
  green: tw`bg-green-500 border-green-600 hover:bg-green-600  hover:border-green-700`,
  blue: tw`bg-blue-500 border-blue-600 hover:bg-blue-600  hover:border-blue-700`,
  pink: tw`bg-pink-500 border-pink-600 hover:bg-pink-600  hover:border-pink-700`,
  teal: tw`bg-teal-500 border-teal-600 hover:bg-teal-600  hover:border-teal-700`,
} as const;

type ButtonProps = {
  className?: string;
  color?: keyof typeof colors;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ color = "indigo", className, children, onClick }: ButtonProps): JSX.Element | null {
  return (
    <button
      className={clsx(
        `px-4 py-2 rounded-md tracking-wide font-semibold text-sm uppercase shadow-lg text-white border-2`,
        className,
        colors[color]
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
