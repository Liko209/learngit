/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';
import _ from 'lodash';

import GroupAPI from '../../../api/glip/group';
import { daoManager, DeactivatedDao } from '../../../dao';
import { Raw } from '../../../framework/model';
import { PartialWithKey } from '../../../models';
import { GroupState } from '../../state/entity';
import { GroupDao } from '../dao';
import { EVENT_TYPES } from '../../../service/constants';
import { ENTITY, SERVICE } from '../../../service/eventKey';
import notificationCenter, {
  NotificationEntityUpdatePayload,
} from '../../../service/notificationCenter';
import { ProfileService, extractHiddenGroupIds } from '../../profile';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import { Post } from '../../post/entity';
import { Profile } from '../../profile/entity';
import { StateService } from '../../state';
import { Group } from '../entity';
import { IGroupService } from '../service/IGroupService';
import { AccountService } from '../../account/service';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { GroupConfigService } from 'sdk/module/groupConfig';

const LOG_TAG = 'GroupHandleDataController';
const hasOwnProperty = Object.prototype.hasOwnProperty;
const SMS_USER_NAME_REGEX = /.*smsuser\+[\d]+.*/;
class GroupHandleDataController {
  constructor(
    public groupService: IGroupService,
    public entitySourceController: IEntitySourceController<Group>,
  ) {}
  getExistedAndTransformDataFromPartial = async (
    groups: Partial<Raw<Group>>[],
  ): Promise<Group[]> => {
    const transformedData: (Partial<Group> | null)[] = await Promise.all(
      groups.map(async (item: Partial<Raw<Group>>) => {
        if (item._id) {
          const finalItem = item;
          try {
            const existedGroup = await this.entitySourceController.get(
              item._id,
            );

            if (existedGroup) {
              type Transformed = PartialWithKey<Group>;
              const transformed: Transformed = transform<Transformed>(
                finalItem,
              );

              await this.entitySourceController.update(transformed);

              if (transformed.id) {
                const updated = await this.entitySourceController.get(
                  transformed.id,
                );
                return updated;
              }
            }
          } catch (error) {
            mainLogger.error(`${JSON.stringify(error)}`);
          }
        }
        return null;
      }),
    );

    return transformedData.filter(
      (item: Group | null) => item !== null,
    ) as Group[];
  };

  calculateDeltaData = async (
    deltaGroup: Raw<Group>,
  ): Promise<Group | void> => {
    const groupDao = daoManager.getDao<GroupDao>(GroupDao);

    const originData = await groupDao.get(deltaGroup._id);
    if (originData && deltaGroup._delta) {
      const { add, remove, set } = deltaGroup._delta;
      const result = originData;
      if (remove) {
        for (const key in remove) {
          if (
            hasOwnProperty.call(remove, key) &&
            hasOwnProperty.call(originData, key)
          ) {
            result[key] = _.difference(originData[key], remove[key]);
          } else {
            // No a regular delta message if the remove field is not existed,
            // Force end the calculation and return
            return;
          }
        }
      }

      if (add) {
        for (const key in add) {
          if (
            hasOwnProperty.call(add, key) &&
            hasOwnProperty.call(originData, key)
          ) {
            result[key] = _.uniq(_.concat([], originData[key], add[key]));
          } else {
            // No a regular delta message if the add field is not existed
            // Force end the calculation and return
            return;
          }
        }
      }

      if (set) {
        for (const key in set) {
          if (hasOwnProperty.call(set, key)) {
            result[key] = set[key];
          }
        }
      }
      return result;
    }
  };

  getTransformData = async (groups: Raw<Group>[]): Promise<Group[]> => {
    const transformedData: (Group | null)[] = await Promise.all(
      groups.map(async (item: Raw<Group>) => {
        let finalItem = item;
        if (finalItem._delta && item._id) {
          const calculated = await this.calculateDeltaData(item);
          if (calculated) {
            return calculated;
          }
          try {
            finalItem = await GroupAPI.requestGroupById(item._id);
          } catch (error) {
            return null;
          }
        }
        const transformed: Group = transform<Group>(finalItem);
        const userConfig = ServiceLoader.getInstance<AccountService>(
          ServiceConfig.ACCOUNT_SERVICE,
        ).userConfig;
        const beRemovedAsGuest =
          transformed.removed_guest_user_ids &&
          transformed.removed_guest_user_ids.includes(
            userConfig.getGlipUserId(),
          );

        if (beRemovedAsGuest) {
          transformed.deactivated = true;
        }

        if (transformed.privacy) {
          transformed.is_public = transformed.privacy === 'protected';
        }

        return transformed;
      }),
    );

    return transformedData.filter(
      (item: Group | null) => item !== null,
    ) as Group[];
  };

  doNotification = async (
    deactivatedData: Group[],
    groups: Group[],
    changeMap?: Map<string, ChangeModel>,
  ) => {
    // https://jira.ringcentral.com/browse/FIJI-4264
    // const deactivatedGroupIds = _.map(deactivatedData, (group: Group) => {
    //   return group.id;
    // });
    // deactivatedGroupIds.length &&
    //   notificationCenter.emitEntityDelete(ENTITY.GROUP, deactivatedGroupIds);
    if (
      (groups && groups.length) ||
      (deactivatedData && deactivatedData.length)
    ) {
      const allGroups =
        deactivatedData && deactivatedData.length
          ? [...groups, ...deactivatedData]
          : groups;

      // update total unread first
      await ServiceLoader.getInstance<StateService>(
        ServiceConfig.STATE_SERVICE,
      ).handleGroupChangeForTotalUnread(allGroups);

      if (changeMap) {
        changeMap.set(ENTITY.GROUP, { entities: allGroups });
      } else {
        notificationCenter.emitEntityUpdate(ENTITY.GROUP, allGroups);
      }
    }
  };

  operateGroupDao = async (deactivatedData: Group[], normalData: Group[]) => {
    try {
      if (deactivatedData.length) {
        daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
        const deleteIds = deactivatedData.map(item => item.id);
        this.entitySourceController.bulkDelete(deleteIds);
        mainLogger.tags(LOG_TAG).info('operateGroupDao() ids:', deleteIds);
      }
      if (normalData.length) {
        this.entitySourceController.bulkUpdate(normalData);
      }
    } catch (e) {
      mainLogger.error(`operateGroupDao error ${JSON.stringify(e)}`);
    }
  };

  extractGroupCursor(groups: Group[], changeMap?: Map<string, ChangeModel>) {
    const groupCursors = _.cloneDeep(groups);
    if (groupCursors.length) {
      if (changeMap) {
        changeMap.set(SERVICE.GROUP_CURSOR, {
          entities: groups,
        });
      } else {
        notificationCenter.emit(SERVICE.GROUP_CURSOR, groups);
      }
    }
    return groups.map((group: Group) => {
      return this.removeCursorsFromGroup(group);
    });
  }

  removeCursorsFromGroup<T extends Raw<Group> | Group>(group: T) {
    return _.omit(group, [
      'post_cursor',
      'post_drp_cursor',
      'last_author_id',
      'team_mention_cursor',
      'team_mention_cursor_offset',
      'removed_cursors_team_mention',
      'admin_mention_cursor',
      'admin_mention_cursor_offset',
      'removed_cursors_admin_mention',
    ]);
  }

  saveDataAndDoNotification = async (
    groups: Group[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) => {
    const pureGroups = this.extractGroupCursor(groups, changeMap);

    const deactivatedData = pureGroups.filter(
      (item: Group) => item && item.deactivated,
    );
    const normalData = pureGroups.filter(
      (item: Group) => item && !item.deactivated,
    );

    await this.operateGroupDao(deactivatedData, normalData);
    if (shouldEmitNotification(source)) {
      await this.doNotification(deactivatedData, normalData, changeMap);
    }
    return normalData;
  };

  handleData = async (
    groups: Raw<Group>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) => {
    if (groups.length === 0) {
      return;
    }
    const transformData = await this.getTransformData(groups);
    const data = transformData.filter(item => item);

    // handle deactivated data and normal data
    await this.saveDataAndDoNotification(data, source, changeMap);
  };

  isSMSGroup(group: Group) {
    return !!(
      group &&
      !group.is_team &&
      group.members.length === 2 &&
      group.set_abbreviation &&
      SMS_USER_NAME_REGEX.test(group.set_abbreviation)
    );
  }

  doFavoriteGroupsNotification = async (favIds: number[]) => {
    mainLogger.debug('-------doFavoriteGroupsNotification--------');
    const filteredFavIds = favIds.filter(
      id => typeof id === 'number' && !Number.isNaN(id),
    );

    const replaceGroups = new Map<number, Group>();
    if (filteredFavIds.length) {
      const profileService = ServiceLoader.getInstance<ProfileService>(
        ServiceConfig.PROFILE_SERVICE,
      );
      const profile = await profileService.getProfile();
      const hiddenIds = profile ? extractHiddenGroupIds(profile) : [];
      const validFavIds = _.difference(filteredFavIds, hiddenIds);
      const groups = await this.groupService.getGroupsByIds(validFavIds, true);

      _.forEach(groups, (group: Group) => {
        if (this.groupService.isValid(group)) {
          replaceGroups.set(group.id, group);
        }
      });
    }
    notificationCenter.emitEntityReplace(ENTITY.FAVORITE_GROUPS, replaceGroups);
  };

  sortFavoriteGroups = (ids: number[], groups: Group[]): Group[] => {
    const result: Group[] = [];
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = 0; j < groups.length; j += 1) {
        if (ids[i] === groups[j].id) {
          result.push(groups[j]);
          break;
        }
      }
    }
    return result;
  };

  handleFavoriteGroupsChanged = async (
    oldProfile: Profile,
    newProfile: Profile,
  ) => {
    mainLogger.debug('---------handleFavoriteGroupsChanged---------');
    if (oldProfile && newProfile) {
      const oldIds = oldProfile.favorite_group_ids || [];
      const newIds = newProfile.favorite_group_ids || [];
      if (oldIds.toString() !== newIds.toString()) {
        const moreFavorites: number[] = _.difference(newIds, oldIds);
        const moreNormals: number[] = _.difference(oldIds, newIds);
        if (moreFavorites.length) {
          const groups = await this.groupService.getGroupsByIds(
            moreFavorites,
            true,
          );
          const resultGroup = groups.filter((item: Group) =>
            this.groupService.isValid(item),
          );
          this.doNonFavoriteGroupsNotification(resultGroup, false);
        }
        if (moreNormals.length) {
          const groups = await this.groupService.getGroupsByIds(
            moreNormals,
            true,
          );
          const resultGroup = groups.filter((item: Group) =>
            this.groupService.isValid(item),
          );

          this.doNonFavoriteGroupsNotification(resultGroup, true);
        }
        await this.doFavoriteGroupsNotification(
          newProfile.favorite_group_ids || [],
        );
      }
    }
  };

  doNonFavoriteGroupsNotification = (groups: Group[], isPut: boolean) => {
    if (isPut) {
      const teams = groups.filter((item: Group) => item.is_team);
      teams.length &&
        notificationCenter.emitEntityUpdate(ENTITY.TEAM_GROUPS, teams);
      const peopleGroups = groups.filter((item: Group) => !item.is_team);
      peopleGroups &&
        notificationCenter.emitEntityUpdate(ENTITY.PEOPLE_GROUPS, peopleGroups);
    } else {
      const teams = groups.filter((item: Group) => item.is_team);
      const teamIds = _.map(teams, (team: Group) => {
        return team.id;
      });
      teamIds &&
        notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teamIds);

      const peopleGroups = groups.filter((item: Group) => !item.is_team);
      const peopleGroupIds = _.map(peopleGroups, (group: Group) => {
        return group.id;
      });
      peopleGroupIds &&
        notificationCenter.emitEntityDelete(
          ENTITY.PEOPLE_GROUPS,
          peopleGroupIds,
        );
    }
  };

  isNeedToUpdateMostRecent4Group = (post: Post, group: Group): boolean => {
    return (
      !group.most_recent_post_created_at ||
      group.most_recent_post_created_at < post.created_at
    );
  };

  getUniqMostRecentPostsByGroup = (
    posts: Post[],
  ): { uniqMaxPosts: Post[]; uniqMyMaxPosts: Post[] } => {
    const groupedPosts = _.groupBy(posts, 'group_id');
    const currentUserId = this._getGlipUserId();
    const uniqMyMaxPosts: Post[] = [];
    const uniqMaxPosts: Post[] = [];
    _.each(groupedPosts, (item: Post[]) => {
      const sortedItem = _.orderBy(item, ['created_at'], ['desc']);
      const maxItem = _.head(sortedItem);
      if (maxItem) {
        uniqMaxPosts.push(maxItem);
      }

      const myMaxItem = sortedItem.find(
        (post: Post) => post.creator_id === currentUserId,
      );
      if (myMaxItem) {
        uniqMyMaxPosts.push(myMaxItem);
      }
    });

    return { uniqMaxPosts, uniqMyMaxPosts };
  };

  handleGroupMostRecentPostChanged = async ({
    type,
    body,
  }: NotificationEntityUpdatePayload<Post>) => {
    if (type !== EVENT_TYPES.UPDATE || !body.entities) {
      return;
    }
    const posts: Post[] = [];
    body.entities.forEach((item: Post) => posts.push(item));
    const { uniqMaxPosts, uniqMyMaxPosts } = this.getUniqMostRecentPostsByGroup(
      posts,
    );
    await this._updateGroupMostRecentPost(uniqMaxPosts);
    await this._updateMyLastPostTime(uniqMyMaxPosts);
  };

  private async _updateGroupMostRecentPost(uniqMaxPosts: Post[]) {
    const groupDao = daoManager.getDao(GroupDao);
    let validGroups: Partial<Raw<Group>>[] = [];
    const ids: number[] = [];
    await groupDao.doInTransaction(async () => {
      const groups: (null | Partial<Raw<Group>>)[] = await Promise.all(
        uniqMaxPosts.map(async (post: Post) => {
          try {
            const group: null | Group = await this.entitySourceController.get(
              post.group_id,
            );
            if (group && this.isNeedToUpdateMostRecent4Group(post, group)) {
              ids.push(post.group_id);
              const pg: Partial<Raw<Group>> = {
                _id: post.group_id,
                most_recent_post_created_at: post.created_at,
                most_recent_content_modified_at: post.modified_at,
              };
              if (post.id > 0) {
                pg['most_recent_post_id'] = post.id;
              }
              return pg;
            }
          } catch (error) {
            return null;
          }
          return null;
        }),
      );
      validGroups = groups.filter(item => item !== null) as Partial<
        Raw<Group>
      >[];
    });
    await this.handlePartialData(validGroups);
    ids.length &&
      notificationCenter.emit(SERVICE.POST_SERVICE.NEW_POST_TO_GROUP, ids);
  }

  getGroupTime = (group: Group) => {
    return Math.max(
      group.__last_accessed_at || 0,
      group.most_recent_post_created_at || 0,
      group.created_at,
    );
  };

  hasUnread = (groupState: GroupState) => {
    return groupState.unread_count || groupState.unread_mentions_count;
  };

  getUnreadGroupIds = async (groups: Group[]) => {
    const ids = _.map(groups, 'id');
    const stateService = ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    );
    const states = (await stateService.getAllGroupStatesFromLocal(ids)) || [];
    const unreadIds = new Set<number>();
    states.forEach((state: GroupState) => {
      if (state && this.hasUnread(state)) {
        unreadIds.add(state.id);
      }
    });
    return unreadIds;
  };

  /**
   * extract out groups/teams which are latest than the oldest unread post
   * or just use default limit length
   */
  filterGroups = async (groups: Group[], limit: number) => {
    const currentUserId = this._getGlipUserId();
    let sortedGroups = groups.filter((model: Group) => {
      if (model.is_team) {
        return true;
      }
      return (
        model.creator_id === currentUserId ||
        model.most_recent_post_created_at !== undefined
      );
    });
    sortedGroups = sortedGroups.sort(
      (group1: Group, group2: Group) =>
        this.getGroupTime(group2) - this.getGroupTime(group1),
    );

    const unreadGroupIds = await this.getUnreadGroupIds(sortedGroups);
    const result: Group[] = sortedGroups.slice(0, limit);
    for (let i = limit; i < sortedGroups.length; ++i) {
      if (unreadGroupIds.has(sortedGroups[i].id)) {
        result.push(sortedGroups[i]);
      }
    }
    return result;
  };

  handlePartialData = async (groups: Partial<Raw<Group>>[]) => {
    if (groups.length === 0) {
      return;
    }
    const transformData = await this.getExistedAndTransformDataFromPartial(
      groups,
    );
    await this.doNotification([], transformData);
  };

  private async _updateMyLastPostTime(uniqMaxPosts: Post[]) {
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    await groupConfigService.handleMyMostRecentPostChange(uniqMaxPosts);
  }

  private _getGlipUserId() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  }

  async handleGroupFetchedPost(groupId: number, posts: Post[]) {
    if (!posts.length) {
      return;
    }
    const currentUserId = this._getGlipUserId();
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    const groupConfig = await groupConfigService.getById(groupId);
    const myLastPostTime = (groupConfig && groupConfig.my_last_post_time) || 0;
    const newerMyPosts = posts.filter(post => {
      return (
        post.created_at > myLastPostTime && post.creator_id === currentUserId
      );
    });

    const sortedMyPosts = _.orderBy(newerMyPosts, ['created_at'], ['desc']);
    const myLastPost = _.head(sortedMyPosts);
    myLastPost && (await this._updateMyLastPostTime([myLastPost]));
    mainLogger.tags(LOG_TAG).log('update most recent my post', myLastPost);
  }
}

export { GroupHandleDataController };
