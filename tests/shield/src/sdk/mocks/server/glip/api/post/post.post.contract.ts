import { IApiContract } from '../../../../../types';
import { GlipPost } from '../../types';

export interface IGlipPostPost extends IApiContract {
  host: 'glip';
  path: '/api/post';
  method: 'post';
  request: {
    data: GlipPost;
  };
  response: {
    data: GlipPost;
  };
}
