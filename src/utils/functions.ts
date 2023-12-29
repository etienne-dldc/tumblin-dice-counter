export function notNil<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Unexpected null value !");
  }
  return value;
}

export function mapMaybe<T, O>(val: T | null, fn: (val: T) => O): O | null {
  if (val === null) {
    return null;
  }
  return fn(val);
}

export const tw = String.raw;

export function mapNum(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function addBetween<T, R>(items: T[], create: (index: number) => R): (T | R)[] {
  if (items.length < 2) {
    return items;
  }
  const [first, ...rest] = items;
  const result: (T | R)[] = [first];
  rest.forEach((item, index) => {
    result.push(create(index));
    result.push(item);
  });

  return result;
}
