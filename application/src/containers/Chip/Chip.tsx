/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 09:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiChip } from 'jui/components/Chip';
import { Avatar } from '@/containers/Avatar';

const Chip = (props: any) => {
  return props.id ? (
    <JuiChip ChipAvatar={Avatar} isError={props.isError} {...props} />
  ) : (
    <JuiChip {...props} />
  );
};

export { Chip };
