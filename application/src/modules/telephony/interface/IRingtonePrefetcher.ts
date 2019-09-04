import { IMedia } from '@/interface/media';

interface IRingtonePrefetcher {
  prefetch: (url: string) => void;
  subscribe: () => void;
  init: () => void;
  dispose: () => void;
  media: IMedia;
}
export { IRingtonePrefetcher };
