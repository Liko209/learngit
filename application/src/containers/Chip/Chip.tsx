/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 09:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiChip } from 'jui/components/Chip';
import { Avatar } from '@/containers/Avatar';

// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
// import PersonModel from '@/store/models/Person';
// import { Person } from 'sdk/src/models';

const Chip = (props: any) => {
  return props.uid ? (
    <JuiChip ChipAvatar={Avatar} {...props} />
  ) : (
    <JuiChip {...props} />
  );
};

export { Chip };
