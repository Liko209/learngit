/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

// enum PROFILE_MODEL_TYPE {
//   PERSON,
//   GROUP,
// }

type ProfileMiniCardProps = {
  id: number; // personId || conversationId
};

type ProfileMiniCardViewProps = {
  id: number;
  type: number;
};

export { ProfileMiniCardProps, ProfileMiniCardViewProps };
