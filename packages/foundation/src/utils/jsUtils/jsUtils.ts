function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}

function getCurrentTime() {
  return new Date().getTime();
}

export { uniqueArray, getCurrentTime };
