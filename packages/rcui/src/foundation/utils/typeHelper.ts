type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export { Omit };
