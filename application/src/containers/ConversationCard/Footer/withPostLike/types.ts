/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-14 19:00:00,
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type WithPostLikeProps = {
  postId: number;
};

type WithPostLikeComponentProps = {
  iLiked: boolean;
  likedUsers: PersonModel[];
  onToggleLike(): Promise<void> | void;
};

export { WithPostLikeProps, WithPostLikeComponentProps };
