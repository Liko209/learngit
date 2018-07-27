declare const ElementQueries: {
  detach(element: any): void;
  findElementQueriesElements(container: any): void;
  init(): void;
  listen(): void;
  update(): void;
};

declare const ResizeSensor: any;

declare module 'css-element-queries/src/ElementQueries' {
  export default ElementQueries;
}

declare module 'css-element-queries/src/ResizeSensor' {
  export default ResizeSensor;
}
