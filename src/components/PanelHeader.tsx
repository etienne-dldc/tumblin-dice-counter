import clsx from "clsx";
import { CaretLeft, CaretRight } from "phosphor-react";
import React from "react";
import { useLayoutInfos } from "../libs/panels";
import { tw } from "../utils/functions";

type Props = {
  title: React.ReactNode;
  onHeaderClick?: () => void;
  color?: keyof typeof colors;
};

const colors = {
  indigo: { main: tw`bg-indigo-100`, icon: tw`text-indigo-900` },
  green: { main: tw`bg-green-100`, icon: tw`text-green-900` },
  blue: { main: tw`bg-blue-100`, icon: tw`text-blue-900` },
  red: { main: tw`bg-red-100`, icon: tw`text-red-900` },
  teal: { main: tw`bg-teal-100`, icon: tw`text-teal-900` },
  pink: { main: tw`bg-pink-100`, icon: tw`text-pink-900` },
};

export function PanelHeader({ title, color = "indigo", onHeaderClick }: Props): JSX.Element | null {
  const layoutInfos = useLayoutInfos();

  const onBack = layoutInfos?.showParent ?? null;
  const onNext = layoutInfos?.showChildren ?? null;

  const hasSides = Boolean(onBack || onNext);

  return (
    <div className={clsx("flex flex-row items-center rounded-md mt-2 p-2", colors[color].main)}>
      {hasSides && (
        <div className="w-8 h-8 flex items-center justify-center">
          {onBack && (
            <button onClick={onBack} className="border-0 flex items-center justify-center w-8 h-8 p-0">
              <CaretLeft className={clsx("w-8 h-8", colors[color].icon)} weight="bold" />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center h-8" onClick={onHeaderClick}>
        <h2 className="text-lg text-center font-bold flex-1">{title}</h2>
      </div>
      {hasSides && (
        <div className="w-8 h-8 flex items-center justify-center">
          {onNext && (
            <button onClick={onNext} className="border-0 flex items-center justify-center w-8 h-8 p-0">
              <CaretRight className={clsx("w-8 h-8", colors[color].icon)} weight="bold" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
