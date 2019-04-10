/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 09:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiChip } from 'jui/components/Chip';
import { Avatar } from '@/containers/Avatar';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

const Chip = (props: any) => {
  const { id } = props;
  const type = GlipTypeUtil.extractTypeId(id);
  if (id) {
    if (type === TypeDictionary.TYPE_ID_PERSON) {
      return <JuiChip ChipAvatar={Avatar} isError={props.isError} {...props} />;
    }
    return (
      <JuiChip ChipAvatar={GroupAvatar} isError={props.isError} {...props} />
    );
  }
  return <JuiChip {...props} />;
};

export { Chip };
