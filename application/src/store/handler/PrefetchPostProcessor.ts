import { IProcessor } from 'sdk/src/framework/processor/IProcessor';
import { ICacheController } from '@/containers/ConversationPage/Stream/cache/ICacheController';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Post } from 'sdk/module/post/entity';
import { mainLogger } from 'sdk';

export default class PrefetchPostProcessor implements IProcessor {
  constructor(
    private _groupId: number,
    private _cacheController: ICacheController<Post>,
  ) {}

  async process(): Promise<boolean> {
    if (this._shouldDoPreload(QUERY_DIRECTION.OLDER)) {
      try {
        await this._cacheController
          .get(this._groupId)
          .fetchData(QUERY_DIRECTION.OLDER);
      } catch (e) {
        mainLogger.error(
          `failed to prefetch post of group ${this._groupId}`,
          e,
        );
      }
    }
    return Promise.resolve(true);
  }

  private _shouldDoPreload(direction: QUERY_DIRECTION) {
    if (this._cacheController.has(this._groupId)) {
      const listHandler = this._cacheController.get(this._groupId);
      return listHandler.hasMore(direction) && listHandler.listStore.size === 0;
    }
    return true;
  }

  canContinue(): boolean {
    return true;
  }
  name(): string {
    return `${this._groupId}`;
  }
}
