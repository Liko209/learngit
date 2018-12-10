import { LoadingMorePlugin } from '@/plugins';
import { POST_LIST_TYPE } from '../types';

type StreamProps = {
  postIds: number[];
  type: POST_LIST_TYPE;
};

type StreamViewProps = {
  ids: number[];
  hasMore: boolean;
  plugins: TPluginsProps;
  type: POST_LIST_TYPE;
};

type TPluginsProps = {
  loadingMorePlugin: LoadingMorePlugin;
};
type SuccinctPost = {
  id: number;
  deactivated?: boolean;
};

export { StreamProps, StreamViewProps, SuccinctPost };
