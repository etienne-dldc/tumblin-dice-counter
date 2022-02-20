import clsx from "clsx";
import React from "react";
import { tw } from "../logic/Utils";

const colors = {
  indigo: tw`bg-indigo-500 hover:bg-indigo-600`,
  red: tw`bg-red-500 hover:bg-red-600`,
  green: tw`bg-green-500 hover:bg-green-600`,
  blue: tw`bg-blue-500 hover:bg-blue-600`,
  pink: tw`bg-pink-500 hover:bg-pink-600`,
  teal: tw`bg-teal-500 hover:bg-teal-600`,
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
        tw`px-4 py-2 rounded-full tracking-wide font-semibold text-sm uppercase shadow-lg text-white`,
        className,
        colors[color]
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
