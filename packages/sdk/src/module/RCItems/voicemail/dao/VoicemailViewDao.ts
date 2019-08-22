/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 13:49:45
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { Voicemail, VoicemailView } from '../entity';
import { IDatabase } from 'foundation/db';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { SortUtils } from 'sdk/framework/utils';
import { FetchDataOptions } from '../../types';
import { DEFAULT_FETCH_SIZE, MESSAGE_AVAILABILITY } from '../../constants';
import { VOICEMAIL_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { IViewDao } from 'sdk/module/base/dao/IViewDao';
import { RCItemUtils } from '../../utils';

const LOG_TAG = 'VoicemailViewDao';

class VoicemailViewDao extends BaseDao<VoicemailView>
  implements IViewDao<number, Voicemail, VoicemailView> {
  static COLLECTION_NAME = 'voicemailView';

  constructor(db: IDatabase) {
    super(VoicemailViewDao.COLLECTION_NAME, db);
  }

  toViewItem(vm: Voicemail): VoicemailView {
    return {
      id: vm.id,
      from: this._getFromView(vm),
      __timestamp: vm.__timestamp,
    };
  }

  toPartialViewItem(partialVM: Partial<Voicemail>): Partial<VoicemailView> {
    return _.pickBy(
      {
        id: partialVM.id,
        from: this._getFromView(partialVM),
        __timestamp: partialVM.__timestamp,
      },
      _.identity,
    );
  }

  getCollection() {
    return this.getDb().getCollection<VoicemailView, number>(this.modelName);
  }

  private _getFromView(vm: Partial<Voicemail> | Voicemail) {
    return RCItemUtils.toCallerView(vm.from);
  }

  async queryVoicemails(options: FetchDataOptions<Voicemail>) {
    const {
      limit = DEFAULT_FETCH_SIZE,
      direction = QUERY_DIRECTION.OLDER,
      anchorId,
      filterFunc,
    } = options;

    const anchorVM = anchorId && (await this.get(anchorId));
    if (!anchorVM && direction === QUERY_DIRECTION.NEWER) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `queryVoicemails return [], invalid anchorId:${anchorId}, direction:${direction}, limit:${limit}`,
        );
      return [];
    }

    const allVMs = await this.getAll();
    if (!allVMs || !allVMs.length) {
      mainLogger.tags(LOG_TAG).info('can not get any voicemailView');
      return [];
    }

    const performanceTracer = PerformanceTracer.start();

    const sortedIds = allVMs
      .filter(
        (view: VoicemailView) =>
          !filterFunc || filterFunc(this._translate2VMForFilter(view)),
      )
      .sort((vmA: VoicemailView, vmB: VoicemailView) =>
        SortUtils.sortModelByKey<VoicemailView, number>(
          vmA,
          vmB,
          ['__timestamp'],
          false,
        ),
      )
      .map((value: VoicemailView) => value.id);

    const voicemailIds = ArrayUtils.sliceIdArray(
      sortedIds,
      limit,
      anchorId,
      direction,
    );

    performanceTracer.end({
      key: VOICEMAIL_PERFORMANCE_KEYS.FILTER_AND_SORT_VOICEMAIL,
    });

    mainLogger
      .tags(LOG_TAG)
      .info(`queryVoicemails success, resultSize:${voicemailIds}`);

    return voicemailIds;
  }

  private _translate2VMForFilter(view: VoicemailView): Voicemail {
    return {
      availability: MESSAGE_AVAILABILITY.ALIVE,
      from: view.from,
    } as Voicemail;
  }
}

export { VoicemailViewDao };
