import { IProcessor } from 'sdk/framework/processor/IProcessor';
import postCacheController from '@/containers/ConversationPage/Stream/cache/PostCacheController';
import { QUERY_DIRECTION } from 'sdk/dao';

export default class PrefetchPostProcessor implements IProcessor {
  constructor(private _groupId: number) {}

  async process(): Promise<boolean> {
    console.log(`PrefetchPostProcessor======> ${this.name()}`);
    await postCacheController
      .get(this._groupId)
      .fetchData(QUERY_DIRECTION.OLDER);
    console.log(`PrefetchPostProcessor done======> ${this.name()}`);
    return Promise.resolve(true);
  }
  canContinue(): boolean {
    return true;
  }
  name(): string {
    return `${this._groupId}`;
  }
}
