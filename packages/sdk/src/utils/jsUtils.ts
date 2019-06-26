function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}

function getCurrentTime() {
  return Date.now(); // a little bit faster
}

export { uniqueArray, getCurrentTime };
