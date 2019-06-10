/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-05 21:06:07
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '../Post';
import { Post } from 'sdk/module/post/entity';

describe('PostModel', () => {
  describe('fileItemVersion', () => {
    it('should return 1 when there is no itemData in Post', () => {
      const postModel = new PostModel({ item_data: undefined } as Post);
      const fileItem = {} as any;
      expect(postModel.fileItemVersion(fileItem)).toEqual(1);
    });

    it('should return the version defined in version map', () => {
      const fileId = 123123;
      const version = 2;
      const postModel = new PostModel({
        item_data: { version_map: { [fileId]: version } },
      } as Post);
      const fileItem = { id: fileId } as any;
      expect(postModel.fileItemVersion(fileItem)).toEqual(version);
    });
  });
});
