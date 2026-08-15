import { DiceFive, DiceFour, DiceOne, DiceSix, DiceThree, DiceTwo } from "@phosphor-icons/react";
import { customAlphabet } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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

export type TDice = (typeof DICES)[number];

export type TDiceValue = TDice["value"];

export const ZONES = ["malus", "x1", "x2", "x3", "x4"] as const;

export type Zone = (typeof ZONES)[number];

export const MULTIPLIER: Record<Zone, number> = {
  malus: -1,
  x1: 1,
  x2: 2,
  x3: 3,
  x4: 4,
};

export type ZoneResult = Array<TDiceValue>;

export type PlayerResult = Record<Zone, ZoneResult>;

export type BonusConfig = {
  enabled: boolean;
  diceCount: number;
  bonusPoints: number;
};

export const DEFAULT_BONUS: BonusConfig = {
  enabled: false,
  diceCount: 4,
  bonusPoints: 20,
};

export type BountyConfig = {
  enabled: boolean;
  amount: number;
};

export const DEFAULT_BOUNTY: BountyConfig = {
  enabled: false,
  amount: 10,
};

export type Round = {
  results: Array<PlayerResult>;
};

export type Game = {
  id: string;
  name: string;
  players: Array<Player>;
  rounds: Array<Round>;
  bonus: BonusConfig;
  bounty: BountyConfig;
};

export type RoundSelected = {
  type: "round";
  roundIndex: number;
  selectedPlayer: null | { playerIndex: number; selectedZone: null | Zone };
};

export type GameSelected =
  | null
  | { type: "players" }
  | { type: "leaderboard" }
  | { type: "settings" }
  | RoundSelected;

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
  selectLeaderboard: () => void;
  selectSettings: () => void;
  setBonusConfig: (config: Partial<BonusConfig>) => void;
  setBountyConfig: (config: Partial<BountyConfig>) => void;
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

export function resultDiceCount(result: PlayerResult): number {
  return ZONES.reduce((sum, zone) => (zone === "malus" ? sum : sum + result[zone].length), 0);
}

export function roundBonus(game: Game, result: PlayerResult): number {
  const { enabled, diceCount, bonusPoints } = game.bonus;
  if (!enabled || diceCount <= 0) {
    return 0;
  }
  return resultDiceCount(result) >= diceCount ? bonusPoints : 0;
}

export function roundScore(game: Game, result: PlayerResult): number {
  return resultScore(result) + roundBonus(game, result);
}

export type RoundBountyResult = {
  targetIndex: number | null;
  pot: number;
  collectors: Array<number>;
  perCollector: number;
  targetLoss: number;
};

export type GameProgression = {
  cumulativeScores: Array<Array<number>>;
  leaders: Array<number | null>;
  bountyResults: Array<RoundBountyResult>;
};

function leaderAtRound(cumulative: Array<number>): number | null {
  let maxIndex: number | null = null;
  let maxValue = -Infinity;
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i] > maxValue) {
      maxValue = cumulative[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

export function computeGameProgression(game: Game): GameProgression {
  const playerCount = game.players.length;
  const cumulativeScores: Array<Array<number>> = [];
  const leaders: Array<number | null> = [];
  const bountyResults: Array<RoundBountyResult> = [];
  const cumulative = new Array(playerCount).fill(0);
  const bountyEnabled = game.bounty.enabled && game.bounty.amount > 0;
  let consecutiveLeader: number | null = null;
  let consecutiveCount = 0;

  for (let roundIndex = 0; roundIndex < game.rounds.length; roundIndex++) {
    const round = game.rounds[roundIndex];

    // Determine the leader from previous round's cumulative scores
    let targetIndex: number | null = null;
    let pot = 0;
    if (bountyEnabled && roundIndex > 0 && playerCount > 1) {
      targetIndex = leaderAtRound(cumulative);
      if (targetIndex !== null) {
        if (consecutiveLeader === targetIndex) {
          consecutiveCount += 1;
        } else {
          consecutiveLeader = targetIndex;
          consecutiveCount = 1;
        }
        pot = game.bounty.amount * consecutiveCount;
      }
    }

    const collectors: Array<number> = [];
    if (targetIndex !== null && pot > 0) {
      const targetRawScore = roundScore(game, round.results[targetIndex]);
      for (let p = 0; p < playerCount; p++) {
        if (p === targetIndex) {
          continue;
        }
        const playerRaw = roundScore(game, round.results[p]);
        if (playerRaw > targetRawScore) {
          collectors.push(p);
        }
      }
    }

    const perCollector = collectors.length > 0 ? Math.ceil(pot / collectors.length) : 0;
    const targetLoss = collectors.length > 0 ? pot : 0;

    bountyResults.push({ targetIndex, pot, collectors, perCollector, targetLoss });

    // Reset consecutive count when bounty is collected
    if (collectors.length > 0) {
      consecutiveLeader = null;
      consecutiveCount = 0;
    }

    // Update cumulative scores with raw round score + bounty adjustments
    for (let p = 0; p < playerCount; p++) {
      let adjustment = 0;
      if (p === targetIndex) {
        adjustment -= targetLoss;
      }
      if (collectors.includes(p)) {
        adjustment += perCollector;
      }
      cumulative[p] += roundScore(game, round.results[p]) + adjustment;
    }

    cumulativeScores.push([...cumulative]);
    leaders.push(leaderAtRound(cumulative));
  }

  return { cumulativeScores, leaders, bountyResults };
}

const progressionCache = new WeakMap<Game, GameProgression>();

export function getGameProgression(game: Game): GameProgression {
  const cached = progressionCache.get(game);
  if (cached) {
    return cached;
  }
  const progression = computeGameProgression(game);
  progressionCache.set(game, progression);
  return progression;
}

export function roundBounty(game: Game, playerIndex: number, roundIndex: number): number {
  if (!game.bounty.enabled) {
    return 0;
  }
  const progression = getGameProgression(game);
  const result = progression.bountyResults[roundIndex];
  if (!result) {
    return 0;
  }
  if (result.targetIndex === playerIndex) {
    return -result.targetLoss;
  }
  if (result.collectors.includes(playerIndex)) {
    return result.perCollector;
  }
  return 0;
}

export function roundTotalScore(
  game: Game,
  result: PlayerResult,
  playerIndex: number,
  roundIndex: number,
): number {
  return roundScore(game, result) + roundBounty(game, playerIndex, roundIndex);
}

export function printScore(score: number): string {
  return score > 0 ? "+" + score : score.toFixed(0);
}

export function playerScore(
  game: Game,
  playerIndex: number,
  lastRoundIndex: number | null,
): number {
  const roundIndex = lastRoundIndex ?? game.rounds.length - 1;
  let sum = 0;
  for (let i = 0; i <= roundIndex; i++) {
    const round = game.rounds[i];
    const result = round.results[playerIndex];
    sum += roundTotalScore(game, result, playerIndex, i);
  }
  return sum;
}

export function diceByValue(value: TDiceValue): TDice {
  return DICES.find((d) => d.value === value) as TDice;
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

function selectedRound(
  ifRound: (round: Round, selected: RoundSelected, state: State) => void,
): StateFn {
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
              bonus: { ...DEFAULT_BONUS },
              bounty: { ...DEFAULT_BOUNTY },
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
            }),
          ),
        renamePlayer: (playerIndex, name) =>
          set(findPlayer(playerIndex, (player) => void (player.name = name))),
        setPlayerColor: (playerIndex, color) =>
          set(findPlayer(playerIndex, (player) => void (player.color = color))),
        removePlayer: (playerIndex) =>
          set(
            selectedGame((game) => {
              game.players.splice(playerIndex, 1);
              game.rounds.forEach((round) => {
                round.results.splice(playerIndex, 1);
              });
            }),
          ),
        addRound: () =>
          set(
            selectedGame((game, state) => {
              game.rounds.push({
                results: game.players.map(() => ({ malus: [], x1: [], x2: [], x3: [], x4: [] })),
              });
              if (state.selected) {
                state.selected.selected = {
                  type: "round",
                  roundIndex: game.rounds.length - 1,
                  selectedPlayer: null,
                };
              }
            }),
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
            }),
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
            }),
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
        selectLeaderboard: () =>
          set((state) => {
            if (state.selected) {
              state.selected.selected = { type: "leaderboard" };
            }
          }),
        selectSettings: () =>
          set((state) => {
            if (state.selected) {
              state.selected.selected = { type: "settings" };
            }
          }),
        setBonusConfig: (config) =>
          set(
            selectedGame((game) => {
              game.bonus = { ...game.bonus, ...config };
            }),
          ),
        setBountyConfig: (config) =>
          set(
            selectedGame((game) => {
              game.bounty = { ...game.bounty, ...config };
            }),
          ),
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
      {
        name: "TUMBLIN_DICE_V1",
        version: 3,
        migrate: (persistedState, version) => {
          let state = (persistedState ?? {}) as { games?: Array<Game> };
          if (version < 2) {
            const games = (state.games ?? []).map((g) => ({
              ...g,
              bonus: g.bonus ?? { ...DEFAULT_BONUS },
            }));
            state = { ...state, games };
          }
          if (version < 3) {
            const games = (state.games ?? []).map((g) => ({
              ...g,
              bounty: g.bounty ?? { ...DEFAULT_BOUNTY },
            }));
            state = { ...state, games };
          }
          return state;
        },
      },
    ),
  ),
);
