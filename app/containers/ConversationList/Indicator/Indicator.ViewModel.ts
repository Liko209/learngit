/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, autorun } from 'mobx';
import { AbstractViewModel } from '@/base';
import { IndicatorProps, IndicatorViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';

class IndicatorViewModel extends AbstractViewModel implements IndicatorViewProps {
  @observable id: number; // group id
  @observable draft: string = '';
  @observable sendFailurePostIds: number[] = [];

  constructor(props: IndicatorProps) {
    super(props);
    this.id = props.id;
    autorun(() => {
      this.getData();
    });
  }

  getData() {
    const group = getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
    this.draft = group.draft || '';
    this.sendFailurePostIds = group.sendFailurePostIds || [];
  }
}
export { IndicatorViewModel };
