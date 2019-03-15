/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-14 19:00:00,
 * Copyright © RingCentral. All rights reserved.
 */

type JuiConversationPostLikeProps = {
  title: string;
  likedUsersCount: number;
  iLiked: boolean;
  onClick(): Promise<void> | void;
};

export { JuiConversationPostLikeProps };
