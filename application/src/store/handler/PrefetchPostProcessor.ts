import postCacheController from '@/containers/ConversationPage/Stream/cache/PostCacheController';
import { QUERY_DIRECTION } from 'sdk/dao';
import { IProcessor } from 'sdk/src/framework/processor/IProcessor';

export default class PrefetchPostProcessor implements IProcessor {
  constructor(private _groupId: number) {}

  async process(): Promise<boolean> {
    if (postCacheController.has(this._groupId)) {
    } else {
      await postCacheController
        .get(this._groupId)
        .fetchData(QUERY_DIRECTION.OLDER);
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
