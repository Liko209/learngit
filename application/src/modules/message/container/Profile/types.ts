/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

enum PROFILE_TYPE {
  MINI_CARD,
  DIALOG,
}

type ProfileProps = {
  id: number; // personId || conversationId
  type: PROFILE_TYPE;
};

type ProfileViewProps = ProfileProps;

export { PROFILE_TYPE, ProfileProps, ProfileViewProps };
