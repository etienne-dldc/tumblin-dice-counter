import React, { useEffect, useState } from "react";
import {
  DiceOne,
  DiceTwo,
  DiceThree,
  DiceFour,
  DiceFive,
  DiceSix,
} from "phosphor-react";
import { InterpolatedMaterialColors as Colors } from "interpolated-material-colors";

function grid(
  big: number,
  half: 0 | 1 = 0,
  quarter: 0 | 1 = 0,
  eighth: 0 | 1 = 0
): number {
  const cells = big * 8 + half * 4 + quarter * 2 + eighth;
  return cells * 3;
}

const ZONES = [
  { multiply: -1, color: Colors.red(500) },
  { multiply: 1, color: Colors.orange(500) },
  { multiply: 2, color: Colors.cyan(700) },
  { multiply: 3, color: Colors.blue(600) },
  { multiply: 4, color: Colors.purple(500) },
  { multiply: 0, color: Colors.grey(400) },
] as const;
type Zone = typeof ZONES[number]["multiply"];
const DICES = [
  { value: 1, icon: DiceOne },
  { value: 2, icon: DiceTwo },
  { value: 3, icon: DiceThree },
  { value: 4, icon: DiceFour },
  { value: 5, icon: DiceFive },
  { value: 6, icon: DiceSix },
] as const;
type Dice = typeof DICES[number];
type DiceValue = Dice["value"];

const DICE_SIZE = grid(4);

type Item = { zone: Zone; value: DiceValue };

export function App() {
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [items, setItems] = useState<Array<Item>>([]);

  const score = items.reduce((acc, item) => {
    return acc + item.value * item.zone;
  }, 0);

  const multiline = false;

  const APP_WIDTH = 700;

  const scale = APP_WIDTH > windowWidth ? windowWidth / APP_WIDTH : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          paddingTop: grid(0, 1),
          paddingBottom: grid(0, 1),
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              height: grid(2),
              lineHeight: grid(2) + "px",
              fontSize: grid(2),
            }}
          >
            {score} points ({items.length} dés)
          </div>
        </div>
        <Spacer vertical={grid(1)} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <button
            style={{
              display: "flex",
              paddingTop: 0,
              paddingBottom: 0,
              height: grid(3),
              lineHeight: grid(3) + "px",
              paddingLeft: grid(2),
              paddingRight: grid(2),
              fontSize: grid(2),
              border: "none",
              borderRadius: grid(0, 0, 1),
              background: Colors.red(700),
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => {
              setItems([]);
            }}
          >
            Reset
          </button>
          <Spacer horizontal={grid(1)} />
          <button
            style={{
              display: "flex",
              paddingTop: 0,
              paddingBottom: 0,
              height: grid(3),
              lineHeight: grid(3) + "px",
              paddingLeft: grid(2),
              paddingRight: grid(2),
              fontSize: grid(2),
              border: "none",
              borderRadius: grid(0, 0, 1),
              background: Colors.blue(700),
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => {
              setItems((prev) => prev.slice(0, -1));
            }}
          >
            Undo
          </button>
        </div>
        <Spacer vertical={grid(1)} />
        {addBetween(
          ZONES.map((zone) => {
            return (
              <Zone
                key={zone.multiply}
                multiply={zone.multiply}
                color={zone.color}
                items={items}
                multiline={multiline}
                onDiceClick={(dice) => {
                  setItems((prev) => [
                    ...prev,
                    { zone: zone.multiply, value: dice },
                  ]);
                }}
              />
            );
          }),
          (i) => (
            <Spacer vertical={grid(0, 0, 1)} key={`spacer-${i}`} />
          )
        )}
      </div>
    </div>
  );
}

type ZoneProps = {
  color: string;
  multiply: Zone;
  items: Array<Item>;
  onDiceClick: (value: DiceValue) => void;
  multiline: boolean;
};

function Zone({ color, multiply, items, onDiceClick, multiline }: ZoneProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: grid(0, 1),
        paddingRight: grid(0, 1),
      }}
    >
      <div
        style={{
          width: grid(3),
          textAlign: "right",
          lineHeight: grid(3) + "px",
          fontSize: grid(2),
          color: Colors.grey(700),
        }}
      >
        ×{multiply}
      </div>
      <Spacer horizontal={grid(0, 1)} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          width: DICE_SIZE * (multiline ? 3 : 6),
        }}
      >
        {DICES.map((dice, i) => {
          const count = items.filter(
            (v) => v.zone === multiply && v.value === dice.value
          ).length;
          return (
            <Dice
              dice={dice}
              key={i}
              color={color}
              count={count}
              onClick={() => {
                onDiceClick(dice.value);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

type DiceProps = {
  dice: Dice;
  color: string;
  count: number;
  onClick: () => void;
};

function Dice({ dice, color, count, onClick }: DiceProps) {
  const Icon = dice.icon;
  return (
    <button
      onClick={onClick}
      style={{
        margin: 0,
        border: "none",
        padding: 0,
        background: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
      }}
    >
      <Icon size={DICE_SIZE} color={color} weight="duotone" />
      {count > 0 && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: grid(1),
            height: grid(1),
            lineHeight: grid(1) + "px",
            fontSize: grid(0, 1, 0, 1),
            borderRadius: grid(0, 1),
            background: color,
            color: "white",
          }}
        >
          {count}
        </div>
      )}
    </button>
  );
}

type SpacerProps = {
  vertical?: number;
  horizontal?: number;
};

function Spacer({ horizontal, vertical }: SpacerProps) {
  const style: React.CSSProperties = { flexShrink: 0 };
  if (horizontal) {
    style.width = horizontal;
  }
  if (vertical) {
    style.height = vertical;
  }
  return <div style={style} />;
}

function addBetween<T>(
  list: Array<T | null>,
  addItem: (sepIndex: number, before: T, after: T) => T
): Array<T> {
  const filtered = list.filter((v): v is T => v !== null);
  return filtered.reduce<Array<T>>((acc, item, index) => {
    if (index > 0) {
      const before = filtered[index - 1];
      const sep = addItem(index - 1, before, item);
      acc.push(sep);
    }
    acc.push(item);
    return acc;
  }, []);
}
