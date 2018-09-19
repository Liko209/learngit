/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 09:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import JuiChip from 'ui-components/molecules/Chip';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
// import PersonModel from '@/store/models/Person';
// import { Person } from 'sdk/src/models';

// interface IProps {
//   id: number;
// }

const Chip = (props: any) => {
  return <JuiChip {...props} />;
};

export default observer(Chip);
