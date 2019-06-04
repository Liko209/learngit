/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 13:49:45
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { Voicemail, VoicemailView } from '../entity';
import { IDatabase, mainLogger } from 'foundation';
import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';

const LOG_TAG = 'VoicemailViewDao';

class VoicemailViewDao extends BaseDao<VoicemailView> {
  static COLLECTION_NAME = 'voicemailView';

  constructor(db: IDatabase) {
    super(VoicemailViewDao.COLLECTION_NAME, db);
  }

  toVoicemailView(vm: Voicemail): VoicemailView {
    return {
      id: vm.id,
      from: vm.from,
      to: vm.to,
      creationTime: vm.creationTime,
      lastModifiedTime: vm.lastModifiedTime,
    };
  }

  toPartialVoicemailView(
    partialVM: Partial<Voicemail>,
  ): Partial<VoicemailView> {
    return {
      ..._.pick(partialVM, [
        'id',
        'from',
        'to',
        'creationTime',
        'lastModifiedTime',
      ]),
    };
  }

  async queryVoicemails(
    limit: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    anchorId?: number,
  ) {
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
    const sortedIds = allVMs
      .sort((vmA: VoicemailView, vmB: VoicemailView) => {
        return natureCompare(vmB.creationTime, vmA.creationTime);
      })
      .map((value: VoicemailView) => {
        return value.id;
      });

    const voicemailIds = ArrayUtils.sliceIdArray(
      sortedIds,
      limit,
      anchorId,
      direction === QUERY_DIRECTION.OLDER
        ? QUERY_DIRECTION.NEWER
        : QUERY_DIRECTION.OLDER,
    );
    mainLogger
      .tags(LOG_TAG)
      .info(`queryVoicemails success, resultSize:${voicemailIds.length}`);

    return voicemailIds;
  }
}

export { VoicemailViewDao };
