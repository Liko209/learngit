function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}

function getCurrentTime() {
  return new Date().getTime();
}

const TEXT_ENCODER = window['TextEncoder']
  ? new TextEncoder()
  : { encode: (str: string) => str };

function bytes(str: string) {
  return TEXT_ENCODER.encode(str).length;
}

export { uniqueArray, getCurrentTime, bytes };
