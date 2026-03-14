import { DiffResult } from "./types/commons";

export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isSameObj<T extends object>(obj1: T, obj2: T): DiffResult<T> {
  const changes: Partial<Record<keyof T, { oldValue: any; newValue: any }>> = {};

  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]) as Set<keyof T>;

  keys.forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      changes[key] = {
        oldValue: obj1[key],
        newValue: obj2[key],
      };
    }
  });

  return {
    isTheSame: Object.keys(changes).length === 0,
    changes,
  };
}
