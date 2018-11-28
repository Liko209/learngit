/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type ProfileMiniCardPersonHeaderProps = {
  id: number;
};

type ProfileMiniCardPersonHeaderViewProps = {
  id: number;
  person: PersonModel;
};

export {
  ProfileMiniCardPersonHeaderProps,
  ProfileMiniCardPersonHeaderViewProps,
};
