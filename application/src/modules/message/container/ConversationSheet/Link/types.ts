/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-22 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import LinkItemModel from '@/store/models/LinkItem';
import PostModel from '@/store/models/Post';

type LinkItemProps = {
  ids: number[];
  postId: number;
};

type LinkItemViewProps = {
  post: PostModel;
  postItems: LinkItemModel[];
  onLinkItemClose: Function;
  canClosePreview: boolean;
  isLinkPreviewDisabled: boolean;
};

export { LinkItemProps, LinkItemViewProps, LinkItemModel };
