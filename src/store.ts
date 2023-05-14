import { customAlphabet } from "nanoid";
import { DiceFive, DiceFour, DiceOne, DiceSix, DiceThree, DiceTwo } from "phosphor-react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

const ALPHA_NUM = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const createGameId = customAlphabet(ALPHA_NUM, 10);

export type Player = {
  name: string;
  color: string;
};

export const DICES = [
  { value: 1, icon: DiceOne },
  { value: 2, icon: DiceTwo },
  { value: 3, icon: DiceThree },
  { value: 4, icon: DiceFour },
  { value: 5, icon: DiceFive },
  { value: 6, icon: DiceSix },
] as const;

export type Dice = (typeof DICES)[number];

export type DiceValue = Dice["value"];

export const ZONES = ["malus", "x1", "x2", "x3", "x4"] as const;

export type Zone = (typeof ZONES)[number];

export const MULTIPLIER: Record<Zone, number> = {
  malus: -1,
  x1: 1,
  x2: 2,
  x3: 3,
  x4: 4,
};

export type ZoneResult = Array<DiceValue>;

export type PlayerResult = Record<Zone, ZoneResult>;

export type Round = {
  results: Array<PlayerResult>;
};

export type Game = {
  id: string;
  name: string;
  players: Array<Player>;
  rounds: Array<Round>;
};

export type RoundSelected = {
  type: "round";
  roundIndex: number;
  selectedPlayer: null | { playerIndex: number; selectedZone: null | Zone };
};

export type GameSelected = null | { type: "players" } | RoundSelected;

export type Selected = null | {
  gameId: string;
  selected: GameSelected;
};

export type State = {
  games: Array<Game>;
  addGame: () => void;
  renameGame: (name: string) => void;
  removeGame: () => void;
  addPlayer: (name?: string) => void;
  renamePlayer: (playerIndex: number, name: string) => void;
  setPlayerColor: (playerIndex: number, color: string) => void;
  removePlayer: (playerIndex: number) => void;
  addRound: () => void;
  removeRound: () => void;
  setZoneResult: (zone: Zone, result: ZoneResult) => void;
  //
  selected: Selected;
  selectHome: () => void;
  selectGame: (gameId: string) => void;
  selectPlayers: () => void;
  selectRound: (roundIndex: number) => void;
  selectPlayer: (playerIndex: number) => void;
  selectZone: (zone: Zone) => void;
};

type ValueFn<T> = (value: T) => void;
type StateFn = (state: State) => void;

export function resultSum(result: ZoneResult): number {
  return result.reduce((sum, dice) => sum + dice, 0);
}

export function zoneScore(zone: Zone, result: ZoneResult): number {
  const score = resultSum(result) * MULTIPLIER[zone];
  return score;
}

export const MULT_SYMBOL = "×";

export function zoneName(zone: Zone): string {
  return {
    malus: MULT_SYMBOL + "-1",
    x1: MULT_SYMBOL + "1",
    x2: MULT_SYMBOL + "2",
    x3: MULT_SYMBOL + "3",
    x4: MULT_SYMBOL + "4",
  }[zone];
}

export function resultScore(result: PlayerResult): number {
  return ZONES.reduce((sum, zone) => sum + zoneScore(zone, result[zone]), 0);
}

export function printScore(score: number): string {
  return score > 0 ? "+" + score : score.toFixed(0);
}

export function playerScore(game: Game, playerIndex: number, lastRoundIndex: number | null): number {
  const roundIndex = lastRoundIndex ?? game.rounds.length - 1;
  let sum = 0;
  for (let i = 0; i <= roundIndex; i++) {
    const round = game.rounds[i];
    const result = round.results[playerIndex];
    sum += resultScore(result);
  }
  return sum;
}

export function diceByValue(value: DiceValue): Dice {
  return DICES.find((d) => d.value === value) as Dice;
}

function selectedGame(ifGame: (game: Game, state: State) => void): StateFn {
  return (state) => {
    if (!state.selected) {
      return;
    }
    const gameId = state.selected.gameId;
    const game = state.games.find((g) => g.id === gameId);
    if (game) {
      ifGame(game, state);
    }
  };
}

function findPlayer(playerIndex: number, ifPlayer: ValueFn<Player>): StateFn {
  return selectedGame((game) => {
    const player = game.players[playerIndex];
    if (player) {
      ifPlayer(player);
    }
  });
}

function selectedRound(ifRound: (round: Round, selected: RoundSelected, state: State) => void): StateFn {
  return selectedGame((game, state) => {
    if (state.selected?.selected?.type !== "round") {
      return;
    }
    const roundIndex = state.selected?.selected?.roundIndex;
    const round = game.rounds[roundIndex];
    if (round) {
      ifRound(round, state.selected.selected, state);
    }
  });
}

export const useStore = create<State>()(
  immer(
    persist(
      (set, get) => ({
        games: [],
        addGame: () =>
          set((state) => {
            const game: Game = {
              id: createGameId(),
              name: `Partie ${state.games.length + 1}`,
              players: [],
              rounds: [],
            };
            state.games.push(game);
          }),
        renameGame: (name) => set(selectedGame((game) => void (game.name = name))),
        removeGame: () => {
          const gameId = get().selected?.gameId;
          if (!gameId) {
            return;
          }
          set((state) => {
            const gameIndex = state.games.findIndex((g) => g.id === gameId);
            if (gameIndex >= 0) {
              state.games.splice(gameIndex, 1);
              state.selected = null;
            }
          });
        },
        addPlayer: (name) =>
          set(
            selectedGame((game) => {
              const nameResolved = name ?? `Player ${game.players.length + 1}`;
              const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
              game.players.push({ name: nameResolved, color });
              game.rounds.forEach((round) => {
                round.results.push({ malus: [], x1: [], x2: [], x3: [], x4: [] });
              });
            })
          ),
        renamePlayer: (playerIndex, name) => set(findPlayer(playerIndex, (player) => void (player.name = name))),
        setPlayerColor: (playerIndex, color) => set(findPlayer(playerIndex, (player) => void (player.color = color))),
        removePlayer: (playerIndex) =>
          set(
            selectedGame((game) => {
              game.players.splice(playerIndex, 1);
              game.rounds.forEach((round) => {
                round.results.splice(playerIndex, 1);
              });
            })
          ),
        addRound: () =>
          set(
            selectedGame((game, state) => {
              game.rounds.push({ results: game.players.map(() => ({ malus: [], x1: [], x2: [], x3: [], x4: [] })) });
              if (state.selected) {
                state.selected.selected = { type: "round", roundIndex: game.rounds.length - 1, selectedPlayer: null };
              }
            })
          ),
        removeRound: () =>
          set(
            selectedGame((game, state) => {
              if (state.selected?.selected?.type !== "round") {
                return;
              }
              const roundIndex = state.selected.selected.roundIndex;
              game.rounds.splice(roundIndex, 1);
              state.selected.selected.roundIndex = game.rounds.length - 1;
            })
          ),
        setZoneResult: (zone, result) =>
          set(
            selectedRound((round, selected) => {
              if (!selected.selectedPlayer) {
                return;
              }
              const playerResult = round.results[selected.selectedPlayer.playerIndex];
              if (!playerResult) {
                return;
              }
              playerResult[zone] = result;
            })
          ),

        selected: null,
        selectHome: () =>
          set((state) => {
            state.selected = null;
          }),
        selectGame: (gameId) =>
          set((state) => {
            state.selected = { gameId, selected: null };
          }),
        selectPlayers: () =>
          set((state) => {
            if (state.selected) {
              state.selected.selected = { type: "players" };
            }
          }),
        selectRound: (roundIndex) =>
          set((state) => {
            if (state.selected) {
              state.selected.selected = { type: "round", roundIndex, selectedPlayer: null };
            }
          }),
        selectPlayer: (playerIndex) =>
          set((state) => {
            if (state.selected?.selected?.type === "round") {
              state.selected.selected.selectedPlayer = { playerIndex, selectedZone: null };
            }
          }),
        selectZone: (zone) =>
          set((state) => {
            if (state.selected?.selected?.type === "round") {
              if (state.selected.selected.selectedPlayer) {
                if (state.selected.selected.selectedPlayer.selectedZone === zone) {
                  state.selected.selected.selectedPlayer.selectedZone = null;
                } else {
                  state.selected.selected.selectedPlayer.selectedZone = zone;
                }
              }
            }
          }),
      }),
      { name: "TUMBLIN_DICE_V1" }
    )
  )
);
