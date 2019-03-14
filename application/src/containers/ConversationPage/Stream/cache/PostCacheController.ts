/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
  TDelta,
  DeltaDataHandler,
} from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY, notificationCenter, WINDOW } from 'sdk/service';
import { Item } from 'sdk/module/item/entity';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { TypeDictionary } from 'sdk/utils';
import { mainLogger } from 'sdk';
import IUsedCache from '@/store/base/IUsedCache';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';
import _ from 'lodash';
import FileItemModel from '@/store/models/FileItem';
import TaskItemModel from '@/store/models/TaskItem';
import LinkItemModel from '@/store/models/LinkItem';
import NoteItemModel from '@/store/models/NoteItem';
import CodeItemModel from '@/store/models/CodeItem';
import EventItemModel from '@/store/models/EventItem';
import ConferenceItemModel from '@/store/models/ConferenceItem';
import ItemModel from '@/store/models/Item';

import { ThumbnailPreloadController } from './ThumbnailPreloadController';
import { SequenceProcessorHandler } from 'sdk/framework/processor/SequenceProcessorHandler';
import PrefetchPostProcessor from '@/store/handler/PrefetchPostProcessor';
import { ICacheController } from './ICacheController';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;
class PostDataProvider implements IFetchSortableDataProvider<Post> {
  private _postService: PostService = PostService.getInstance();
  private _itemStoreMap = new Map<number, ENTITY_NAME>();

  constructor(private _groupId: number) {
    // fix me: FIJI-3958 Item store refactoring
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_FILE, ENTITY_NAME.FILE_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_TASK, ENTITY_NAME.TASK_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_LINK, ENTITY_NAME.LINK_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_PAGE, ENTITY_NAME.NOTE_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_CODE, ENTITY_NAME.CODE_ITEM);
    this._itemStoreMap.set(
      TypeDictionary.TYPE_ID_EVENT,
      ENTITY_NAME.EVENT_ITEM,
    );
    this._itemStoreMap.set(
      TypeDictionary.TYPE_ID_CONFERENCE,
      ENTITY_NAME.CONFERENCE_ITEM,
    );
  }
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Post>,
  ): Promise<{ data: Post[]; hasMore: boolean }> {
    const { posts, hasMore, items } = await this._postService.getPostsByGroupId(
      {
        direction,
        groupId: this._groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      },
    );
    items.forEach((item: Item) => {
      const type = GlipTypeUtil.extractTypeId(item.id);
      const entityName = this._itemStoreMap.get(type);
      if (entityName) {
        storeManager.dispatchUpdatedDataModels(entityName, [item]);
      } else {
        storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, [item]);
      }
    });

    return { hasMore, data: posts };
  }
}

class PostUsedItemCache implements IUsedCache {
  getUsedId(): number[] {
    let usedItemIds: number[] = [];
    const data = (storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<Post, PostModel>).getData();

    usedItemIds = [
      ...new Set(
        Object.values(data)
          .map(a => a.id)
          .flat(),
      ),
    ];

    return usedItemIds;
  }
}

class PostCacheController implements ICacheController<Post> {
  private _cacheMap: Map<number, FetchSortableDataListHandler<Post>>;
  private _prefetchHandler: SequenceProcessorHandler;

  private _cacheDeltaDataHandlerMap: Map<number, DeltaDataHandler> = new Map();
  private _thumbnailPreloadController: ThumbnailPreloadController;
  private _currentGroupId: number = 0;

  private _postUsedItemCache = new PostUsedItemCache();

  constructor() {
    this._cacheMap = new Map();
    this._prefetchHandler = new SequenceProcessorHandler(
      'SequenceProcessorHandler',
    );

    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this.onNetWorkChanged(onLine);
    });

    (storeManager.getEntityMapStore(ENTITY_NAME.POST) as MultiEntityMapStore<
      Post,
      PostModel
    >).addUsedCache(this);

    // fix me: FIJI-3958 Item store refactoring
    (storeManager.getEntityMapStore(
      ENTITY_NAME.FILE_ITEM,
    ) as MultiEntityMapStore<Item, FileItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.TASK_ITEM,
    ) as MultiEntityMapStore<Item, TaskItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.LINK_ITEM,
    ) as MultiEntityMapStore<Item, LinkItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.NOTE_ITEM,
    ) as MultiEntityMapStore<Item, NoteItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.CODE_ITEM,
    ) as MultiEntityMapStore<Item, CodeItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.EVENT_ITEM,
    ) as MultiEntityMapStore<Item, EventItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(
      ENTITY_NAME.CONFERENCE_ITEM,
    ) as MultiEntityMapStore<Item, ConferenceItemModel>).addUsedCache(
      this._postUsedItemCache,
    );

    (storeManager.getEntityMapStore(ENTITY_NAME.ITEM) as MultiEntityMapStore<
      Item,
      ItemModel
    >).addUsedCache(this._postUsedItemCache);
  }

  getThumbnailPreloadController() {
    if (!this._thumbnailPreloadController) {
      this._thumbnailPreloadController = new ThumbnailPreloadController();
    }
    return this._thumbnailPreloadController;
  }

  private _preloadThumbnail(postModel: PostModel) {
    const itemIds: number[] = postModel.itemIds.filter((id: number) => {
      return TypeDictionary.TYPE_ID_FILE === GlipTypeUtil.extractTypeId(id);
    });

    if (itemIds && itemIds.length) {
      this.getThumbnailPreloadController().preload(itemIds);
    }
  }

  getUsedId(): number[] {
    let ids: number[] = [];
    this._cacheMap.forEach((value, key, map) => {
      ids = _.union(
        ids,
        (map.get(key) as FetchSortableDataListHandler<Post>).sortableListStore
          .getIds,
      );
    });
    return ids;
  }

  onNetWorkChanged(onLine: boolean) {
    if (onLine) {
      for (const groupId of this._cacheMap.keys()) {
        const processor = new PrefetchPostProcessor(groupId, this);
        this._prefetchHandler.addProcessor(processor);
      }
    }
  }

  has(groupId: number): boolean {
    return this._cacheMap.has(groupId);
  }

  get(
    groupId: number,
    jump2PostId?: number,
  ): FetchSortableDataListHandler<Post> {
    let listHandler = !!jump2PostId ? undefined : this._cacheMap.get(groupId);
    if (!listHandler) {
      const fetchDataCallback = async (delta: TDelta) => {
        if (delta) {
          let sortableModels: ISortableModel[] = [];
          if (delta.added && delta.added.length) {
            sortableModels = sortableModels.concat(delta.added);
          }

          if (delta.updated && delta.updated.length) {
            sortableModels = sortableModels.concat(delta.updated);
          }

          if (sortableModels.length) {
            const postStore = storeManager.getEntityMapStore(
              ENTITY_NAME.POST,
            ) as MultiEntityMapStore<Post, PostModel>;

            await Promise.all(
              sortableModels.map(
                async (sortableModel: ISortableModel<Post>) => {
                  if (sortableModel) {
                    this._preloadThumbnail(postStore.get(sortableModel.id));
                  }
                },
              ),
            );
          }
        }
      };

      this._cacheDeltaDataHandlerMap.set(groupId, fetchDataCallback);

      const options = {
        transformFunc: (dataModel: Post) => ({
          id: dataModel.id,
          sortValue: dataModel.created_at,
        }),
        hasMoreUp: true,
        hasMoreDown: !!jump2PostId,
        isMatchFunc: isMatchedFunc(groupId),
        entityName: ENTITY_NAME.POST,
        eventName: `${ENTITY.POST}.${groupId}`,
        dataChangeCallBack: fetchDataCallback,
      };

      listHandler = new FetchSortableDataListHandler(
        new PostDataProvider(groupId),
        options,
      );

      if (!jump2PostId) {
        this.set(groupId, listHandler);
        listHandler.maintainMode = true;
      }
    }
    return listHandler;
  }

  setCurrentConversation(groupId: number) {
    if (this._currentGroupId !== groupId) {
      if (this.has(this._currentGroupId)) {
        mainLogger.debug(
          `PostCacheController: setCurrentConversation original =>  ${
            this._currentGroupId
          }`,
        );
        this.get(this._currentGroupId).maintainMode = true;
      }

      if (this.has(groupId)) {
        mainLogger.debug(
          `PostCacheController: setCurrentConversation new => ${groupId}`,
        );
        this.get(groupId).maintainMode = false;
      }

      this._currentGroupId = groupId;
    }
  }

  releaseCurrentConversation(groupId: number) {
    if (this._currentGroupId === groupId) {
      this._remove(groupId);
      this._currentGroupId = 0;
    } else {
      if (this.has(groupId)) {
        mainLogger.debug(
          `PostCacheController: releaseCurrentConversation =>  ${groupId}`,
        );
        this.get(groupId).maintainMode = true;
      }
    }
  }

  set(groupId: number, listHandler: FetchSortableDataListHandler<Post>) {
    this._cacheMap.set(groupId, listHandler);
  }

  remove(groupId: number) {
    if (this.has(groupId)) {
      if (this._currentGroupId !== groupId) {
        this._remove(groupId);
      }
    }
  }

  private _remove(groupId: number) {
    const preloadThumbnail = this._cacheDeltaDataHandlerMap.get(groupId);
    if (preloadThumbnail) {
      this.get(groupId).removeDataChangeCallback(preloadThumbnail);
      this._cacheDeltaDataHandlerMap.delete(groupId);
    }

    this.get(groupId).dispose();
    this._cacheMap.delete(groupId);
  }
}

const postCacheController = new PostCacheController();

export { PostCacheController };
export default postCacheController;
