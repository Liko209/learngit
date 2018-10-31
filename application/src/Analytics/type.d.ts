type TSegment = {
  identify: (userId: number, traits: object) => any;
};
declare module 'load-segment' {
  export default function Segment({ key }: { key: string }): TSegment;
}
