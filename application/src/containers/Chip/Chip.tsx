/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 09:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Translation } from 'react-i18next';
import { JuiChip } from 'jui/components/Chip';
import { Avatar } from '@/containers/Avatar';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

const ChipComponent = (props: any) => {
  const { id, t } = props;
  if (id) {
    const type = GlipTypeUtil.extractTypeId(id);
    if (type === TypeDictionary.TYPE_ID_PERSON) {
      return (
        <JuiChip PersonAvatar={Avatar} isError={props.isError} deleteTooltip={t('common.remove')} {...props} />
      );
    }
    return (
      <JuiChip GroupAvatar={GroupAvatar} isError={props.isError} deleteTooltip={t('common.remove')} {...props} />
    );
  }
  return <JuiChip {...props} />;
};

const Chip = (props: any) => (
  <Translation>
    {(t) => <ChipComponent {...props} t={t} />}
  </Translation>
);

export { Chip };
