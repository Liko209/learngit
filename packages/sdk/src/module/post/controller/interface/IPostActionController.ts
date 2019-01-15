/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 14:31:02
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity/Post';
import { EditPostType } from '../../types';
interface IPostActionController {
  likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null>;
  editPost(params: EditPostType): Promise<Post | null>;

  deletePost(id: number): Promise<boolean>;

  updateLocalPost(post: Partial<Post>): Promise<Post | null>;
}
export { IPostActionController };
