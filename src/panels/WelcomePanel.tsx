import type { ReactElement } from "react";
import type { Panel } from "../libs/panels";

export function WelcomePanel(): Panel {
  return {
    key: "welcome",
    width: 200,
    optional: true,
    flex: 2,
    content: <Content />,
  };
}

export function Content(): ReactElement | null {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p>Bonjour !</p>
    </div>
  );
}
