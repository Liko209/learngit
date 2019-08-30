type FunctionDecorator = <T extends (...args: any[]) => any>(op: T) => T;

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
