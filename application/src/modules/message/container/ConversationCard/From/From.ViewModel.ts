/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:45:42
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, comparer } from 'mobx';
import i18nT from '@/utils/i18nT';
import { AbstractViewModel } from '@/base';
import { FromProps, FromViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';

class FromViewModel extends AbstractViewModel implements FromViewProps {
  @observable
  id: number;
  @observable
  displayName: string = '';
  constructor(props: FromViewProps) {
    super(props);
    this.reaction(
      () => ({
        displayName: this._group.displayName,
        isArchived: this._group.isArchived,
      }),
      async ({
        displayName,
        isArchived,
      }: {
        displayName: string;
        isArchived: boolean;
      }) => {
        const suffix = isArchived
          ? await i18nT('people.team.archivedSuffix')
          : '';
        this.displayName = `${displayName}${suffix}`;
      },
      {
        fireImmediately: true,
        equals: comparer.structural,
      },
    );
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }
  @computed
  get disabled() {
    return !!this._group.isArchived;
  }
  @computed
  get isTeam(): boolean {
    return !!this._group.isTeam;
  }

  onReceiveProps({ id }: FromProps) {
    if (id !== this.id) {
      this.id = id;
    }
  }
}

export { FromViewModel };
