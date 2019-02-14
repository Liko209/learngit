import { IProcessor } from 'sdk/framework/processor/IProcessor';
import postCacheController from '@/containers/ConversationPage/Stream/cache/PostCacheController';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'sdk';

export default class PrefetchPostProcessor implements IProcessor {
  constructor(private _groupId: number) {}

  async process(): Promise<boolean> {
    mainLogger.info(`PrefetchPostProcessor======> ${this.name()}`);
    if (postCacheController.has(this._groupId)) {
      mainLogger.info(
        `PrefetchPostProcessor======> ${this._groupId} is already fetched`,
      );
    } else {
      await postCacheController
        .get(this._groupId)
        .fetchData(QUERY_DIRECTION.OLDER);
      mainLogger.info(`PrefetchPostProcessor done======> ${this.name()}`);
    }

    return Promise.resolve(true);
  }
  canContinue(): boolean {
    return true;
  }
  name(): string {
    return `${this._groupId}`;
  }
}
