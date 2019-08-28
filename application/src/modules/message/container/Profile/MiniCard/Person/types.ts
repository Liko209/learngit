/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type ProfileMiniCardPersonProps = {
  id: number;
};

type ProfileMiniCardPersonViewProps = {
  id: number;
  colonsEmoji: string;
  statusPlainText: string;
  person: PersonModel;
  isMe: boolean;
};

export { ProfileMiniCardPersonProps, ProfileMiniCardPersonViewProps };
