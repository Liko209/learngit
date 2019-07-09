const MAX_INTEGER = 9007199254740992;

function randomInt(): number {
  return Math.floor(Math.random() * MAX_INTEGER);
}

function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

enum TYPES {
  String = '[object String]',
  Boolean = '[object Boolean]',
  Number = '[object Number]',
  Object = '[object Object]',
  Function = '[object Function]',
  Undefined = '[object Undefined]',
  Null = '[object Null]',
}

const PARSER_MAP: { [key in TYPES]: (item: any) => string } = {
  '[object Object]': (item: object) => {
    try {
      return JSON.stringify(item);
    } catch {
      return '[object Object]';
    }
  },
  '[object String]': (item: string) => item,
  '[object Function]': () => '[object Function]',
  '[object Undefined]': () => 'undefined',
  '[object Null]': () => 'null',
  '[object Boolean]': (item: boolean) => String(item),
  '[object Number]': (item: number) => String(item),
};

function stringifyParams(...params: any): string[] {
  return params.map((item: any) => {
    const type = Object.prototype.toString.call(item);
    if (PARSER_MAP[type]) {
      return PARSER_MAP[type](item);
    }
    return item ? item.toString() : type;
  });
}

export { randomInt, sleep, stringifyParams };
