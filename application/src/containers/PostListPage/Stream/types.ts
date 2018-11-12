import { LoadingMorePlugin } from '@/plugins';

type StreamProps = {
  postIds: number[];
};

type StreamViewProps = {
  postIds: number[];
  hasMore: boolean;
  plugins: TPluginsProps;
};

type TPluginsProps = {
  loadingMorePlugin: LoadingMorePlugin;
};

export { StreamProps, StreamViewProps };
