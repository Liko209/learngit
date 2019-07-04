/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-21 09:14:45
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import { ENTITY_LIST, EVENT_TYPES, ENTITY } from 'sdk/service';
import { IEntityDataProvider } from '@/store/base/fetch';
import { IdListPaginationHandler } from '@/store/handler/IdListPagingHandler';
import CallLogModel from '@/store/models/CallLog';
import { ENTITY_NAME } from '@/store/constants';
import notificationCenter, {
  NotificationEntityPayload,
  NotificationEntityDeletePayload,
  NotificationEntityUpdatePayload,
  NotificationEntityReplacePayload,
  NotificationEntityReloadPayload,
} from 'sdk/service/notificationCenter';
import { mainLogger } from 'sdk';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { SortUtils } from 'sdk/framework/utils';
import { IdModel } from 'sdk/framework/model';

const MODULE_NAME = 'RecentCallLogsHandler';
class CallLogProvider implements IEntityDataProvider<CallLog, string> {
  async getByIds(ids: string[]) {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    return callLogService.batchGet(ids, true);
  }
}

class RecentCallLogsHandler {
  private _recentCalls: Map<string, { id: string; creationTime: number }>;
  private _recentCallIds: string[];
  private _idListHandler: IdListPaginationHandler<
    CallLog,
    CallLogModel,
    string
  >;

  async init() {
    await this._initRecentCallInfo();

    const filterFunc = (model: CallLogModel) => {
      return !model.deactivated;
    };

    const isMatchFunc = (entity: CallLog) => {
      return !entity.__deactivated && this._recentCallIds.includes(entity.id);
    };

    this._idListHandler = new IdListPaginationHandler(this._recentCallIds, {
      filterFunc,
      isMatchFunc,
      eventName: ENTITY_LIST.CALL_LOG_LIST,
      entityName: ENTITY_NAME.CALL_LOG,
      entityDataProvider: new CallLogProvider(),
      defaultHasMoreDown: true,
    });

    notificationCenter.on(ENTITY.CALL_LOG, this.handleCallLogChanges);
  }

  dispose() {
    notificationCenter.off(ENTITY.CALL_LOG, this.handleCallLogChanges);
    this._idListHandler && this._idListHandler.dispose();
  }

  get foc() {
    return this._idListHandler.fetchSortableDataHandler();
  }

  get recentCallIds() {
    return this._recentCallIds;
  }

  private async _initRecentCallInfo() {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    this._recentCalls = await callLogService.fetchRecentCallLogs();
    this._recentCallIds = this._toSortedIds(this._recentCalls);
    mainLogger
      .tags(MODULE_NAME)
      .log('_initRecentCallInfo', { idsLen: this._recentCallIds.length });
  }

  handleCallLogChanges = (
    payload: NotificationEntityPayload<CallLog, string>,
  ) => {
    if (!this._idListHandler) {
      return;
    }

    switch (payload.type) {
      case EVENT_TYPES.DELETE:
        this._handleDataDeleted(payload);
        break;
      case EVENT_TYPES.UPDATE:
        this._handleDataUpdate(payload);
        break;
      case EVENT_TYPES.REPLACE:
        this._handleDataReplace(payload);
        break;
      case EVENT_TYPES.RELOAD:
        this._handleDataReload(payload);
        break;
    }
  }

  private _handleDataReplace(
    payload: NotificationEntityReplacePayload<CallLog, string>,
  ) {
    let needUpdate = false;
    const toDeletedIds = Array.from(payload.body.entities.keys());
    for (const iterator of this._recentCalls) {
      if (toDeletedIds.includes(iterator[1].id)) {
        this._recentCalls.delete(iterator[0]);
        needUpdate = true;
      }
    }

    const entities = Array.from(payload.body.entities.values());
    needUpdate = this._checkAndHandleUpdate(entities) || needUpdate;
    needUpdate && this._updateSourceIds(this._recentCalls);
  }

  private _handleDataUpdate(
    payload: NotificationEntityUpdatePayload<CallLog, string>,
  ) {
    const entities = Array.from(payload.body.entities.values());
    this._checkAndHandleUpdate(entities) &&
      this._updateSourceIds(this._recentCalls);
  }

  private _checkAndHandleUpdate(entities: CallLog[]) {
    let hasUpdate = false;
    for (const call of entities) {
      const phoneNumber = this._getPhoneNumber(call);
      if (phoneNumber) {
        const record = this._recentCalls.get(phoneNumber);
        if (!record || (record && call.__timestamp > record.creationTime)) {
          hasUpdate = true;
          this._recentCalls.set(phoneNumber, {
            id: call.id,
            creationTime: call.__timestamp,
          });
        }
      }
    }
    return hasUpdate;
  }

  private _getPhoneNumber(call: CallLog) {
    const caller =
      call.direction === CALL_DIRECTION.INBOUND ? call.from : call.to;
    return caller ? caller.extensionNumber || caller.phoneNumber : undefined;
  }

  private _updateSourceIds(
    recentCalls: Map<
      string,
      {
        id: string;
        creationTime: number;
      }
    >,
  ) {
    this._recentCallIds = this._toSortedIds(recentCalls);

    this._idListHandler.onSourceIdsChanged(this._recentCallIds);
    mainLogger
      .tags(MODULE_NAME)
      .log('_updateSourceIds', { newSourceIdLens: this._recentCallIds.length });
  }

  private _toSortedIds(
    recentCalls: Map<
      string,
      {
        id: string;
        creationTime: number;
      }
    >,
  ) {
    const sortedCallInfos = Array.from(recentCalls.values()).sort((a, b) => {
      return SortUtils.sortModelByKey<IdModel<string>, string>(
        a,
        b,
        ['creationTime'],
        true,
      );
    });

    return sortedCallInfos.map(v => v.id);
  }

  private async _handleDataDeleted(
    payload: NotificationEntityDeletePayload<string>,
  ) {
    const deletedSortableModelIds = payload.body.ids;
    if (this._recentCallIds && deletedSortableModelIds) {
      const shouldReFetch = deletedSortableModelIds.some((value: string) => {
        return this._recentCallIds.includes(value);
      });
      mainLogger
        .tags(MODULE_NAME)
        .log('receive delete call log, need to reFetch', { shouldReFetch });
      if (shouldReFetch) {
        await this._initRecentCallInfo();
      }
    }
  }

  private async _handleDataReload(
    payload: NotificationEntityReloadPayload<string>,
  ) {
    mainLogger
      .tags(MODULE_NAME)
      .log('receive reload data, reload all recent call logs', { payload });

    await this._initRecentCallInfo();
    this._idListHandler.onSourceIdsChanged(this._recentCallIds);
  }
}

export { RecentCallLogsHandler };
