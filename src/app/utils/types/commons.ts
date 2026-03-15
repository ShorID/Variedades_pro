export type PropType<T, K extends keyof T> = T[K];

export type DiffResult<T> = {
  isTheSame: boolean;
  changes: Partial<Record<keyof T, { oldValue: any; newValue: any }>>;
};
