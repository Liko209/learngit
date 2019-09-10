/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 10:01:51
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { RCItemApi } from 'sdk/api/ringcentral';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';
import { notificationCenter } from 'sdk/service';
import { RCMessage } from '../../types';
import { MESSAGE_AVAILABILITY, READ_STATUS } from '../../constants';
import { Raw } from 'sdk/framework/model';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { RC_ITEMS_POST_PERFORMANCE_KEYS } from '../../config/performanceKeys';

class RcMessageActionController<T extends RCMessage> {
  constructor(
    private controllerName: string,
    protected entitySourceController: IEntitySourceController<T>,
    protected partialModifyController: IPartialModifyController<T>,
  ) {}

  async deleteRcMessages(entityIds: number[], purge: boolean) {
    const performanceTracer = PerformanceTracer.start();
    mainLogger.tags(this.controllerName).info('deleteRcMessages', entityIds);
    try {
      const messages = await this.entitySourceController.batchGet(entityIds);
      messages.forEach((value: T) => {
        value.availability = purge
          ? MESSAGE_AVAILABILITY.PURGED
          : MESSAGE_AVAILABILITY.DELETED;
      });
      await RCItemApi.deleteMessage(entityIds);
      performanceTracer.trace({
        key: RC_ITEMS_POST_PERFORMANCE_KEYS.DELETE_RC_MESSAGE_FROM_SERVER,
      });
      notificationCenter.emitEntityUpdate(
        this.entitySourceController.getEntityNotificationKey(),
        messages,
      );
      await this.entitySourceController.bulkDelete(entityIds);
      return true;
    } catch (error) {
      mainLogger
        .tags(this.controllerName)
        .warn('failed to delete messages: ', entityIds);
      throw error;
    } finally {
      performanceTracer.end({
        key: RC_ITEMS_POST_PERFORMANCE_KEYS.DELETE_RC_MESSAGE,
      });
    }
  }

  async updateReadStatus(messageId: number, toStatus: READ_STATUS) {
    mainLogger
      .tags(this.controllerName)
      .info('updateMessageReadStatus', { messageId, toStatus });

    const preHandlePartialEntity = (partialEntity: Partial<Raw<T>>) => ({
      ...partialEntity,
      readStatus: toStatus,
    });

    const doUpdateEntity = async (updatedEntity: T) => {
      const newVm = await RCItemApi.updateMessageReadStatus<T>(
        updatedEntity.id,
        updatedEntity.readStatus,
      );
      this.entitySourceController.update(newVm);
      notificationCenter.emitEntityUpdate(
        this.entitySourceController.getEntityNotificationKey(),
        [newVm],
      );
      return newVm;
    };

    await this.partialModifyController.updatePartially({
      preHandlePartialEntity,
      doUpdateEntity,
      entityId: messageId,
    });
  }

  async buildDownloadUrl(url: string) {
    try {
      const accountService = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      );
      const rcToken = await accountService.getRCToken();

      return rcToken && rcToken.access_token
        ? `${url}?access_token=${rcToken.access_token}`
        : '';
    } catch (error) {
      mainLogger.tags(this.controllerName).log('failed to get url', error);
      return '';
    }
  }
}

export { RcMessageActionController };
