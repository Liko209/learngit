/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-22 17:31:41
 * Copyright © RingCentral. All rights reserved.
 */
import { RCInfoApi } from 'sdk/api/ringcentral';
import { RCPresenceEventPayload } from 'sdk/module/rcEventSubscription/types';
import { mainLogger } from 'foundation/log';
import {
  SingletonSequenceProcessor,
  SequenceProcessorHandler,
  IProcessor,
} from 'sdk/framework/processor';
import { notificationCenter, RC_INFO } from 'sdk/service';
import { RCPermissionController } from './RCPermissionController';
import { ERCServiceFeaturePermission } from '../types';

const MODULE_NAME = 'RCPresenceController';
class RCPresenceController {
  private _syncQueueHandler: SequenceProcessorHandler;

  constructor(private _rcPermissionController: RCPermissionController) {}
  syncRCPresence = async () => {
    const canDoSync = await this._canSyncRCPresence();
    if (!canDoSync) {
      return;
    }
    const processor = new class implements IProcessor {
      async process() {
        try {
          SingletonSequenceProcessor.processorHandler.addProcessor;
          const presence = <RCPresenceEventPayload>(
            await RCInfoApi.getRCPresence()
          );
          notificationCenter.emitKVChange(RC_INFO.RC_PRESENCE, presence);
          return true;
        } catch (error) {
          mainLogger.tags(MODULE_NAME).log('failed to sync rc presence', error);
          return false;
        }
      }

      name() {
        return `${Date.now()}_${MODULE_NAME}`;
      }
    }();
    this._getQueueHandler().addProcessor(processor);
  };

  private async _canSyncRCPresence() {
    const hasVoipPermission = await this._rcPermissionController.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.VOIP_CALLING,
    );
    if (!hasVoipPermission) {
      return false;
    }

    const hasRCPresence = await this._rcPermissionController.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.RC_PRESENCE,
    );
    if (!hasRCPresence) {
      return false;
    }

    return true;
  }

  private _getQueueHandler() {
    if (!this._syncQueueHandler) {
      /* eslint-disable */
      this._syncQueueHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
        {
          name: MODULE_NAME,
          addProcessorStrategy: (
            totalProcessors: IProcessor[],
            newProcessor: IProcessor,
            existed: boolean,
          ) => {
            return [newProcessor];
          },
        },
      );
      /* eslint-disable */
    }
    return this._syncQueueHandler;
  }

  dispose() {
    this._getQueueHandler().clear();
  }
}

export { RCPresenceController };
