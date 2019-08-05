import { createDecorator } from 'framework/src';

interface IRingtonePrefetcher {
  prefetch: (url: string) => void;
  subscribe: () => void;
  init: () => void;
  dispose: () => void;
}
const IRingtonePrefetcher = createDecorator('IRingtonePrefetcher');
export { IRingtonePrefetcher };
