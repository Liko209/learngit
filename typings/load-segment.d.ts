type TSegment = {
  identify: (id: number, traits: object) => any;
  page: (name: string, properties?: any) => any;
  reset: () => any;
  track: (name: string, properties?: any) => any;
};
declare module 'load-segment' {
  export default function Segment({ key }: { key: string }): TSegment;
}
