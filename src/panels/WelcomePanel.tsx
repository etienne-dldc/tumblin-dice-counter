import { Panel } from "../libs/panels";
import React from "react";

type Props = {
  //
};

export function WelcomePanel(props: Props): Panel {
  return {
    key: "welcome",
    width: 200,
    optional: true,
    flex: 2,
    content: <Content {...props} />,
  };
}

export function Content({}: Props): JSX.Element | null {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p>Bonjour !</p>
    </div>
  );
}
