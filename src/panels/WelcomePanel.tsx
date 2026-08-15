import { Panel } from "../libs/panels";

export function WelcomePanel(): Panel {
  return {
    key: "welcome",
    width: 200,
    optional: true,
    flex: 2,
    content: <Content />,
  };
}

export function Content(): JSX.Element | null {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p>Bonjour !</p>
    </div>
  );
}
