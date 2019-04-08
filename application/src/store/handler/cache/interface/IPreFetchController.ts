/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 15:29:10
 * Copyright © RingCentral. All rights reserved.
 */

interface IPreFetchController {
  name(): string;
  doPreFetch(groupId: number): Promise<void>;
  getUnCachedGroupIds(): number[];
  hasCache(groupId: number): boolean;

  remove(groupId: number): void;
  releaseCurrentConversation(groupId: number): void;
  setCurrentCacheConversation(groupId: number): void;
}

export { IPreFetchController };
