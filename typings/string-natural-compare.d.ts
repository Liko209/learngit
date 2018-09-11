declare module 'string-natural-compare' {
  interface INatureCompare {
    (a: any, b: any): number;
    caseInsensitive: INatureCompare;
  }
  const natureCompare: INatureCompare;
  export = natureCompare;
}
