function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}

export { uniqueArray };
