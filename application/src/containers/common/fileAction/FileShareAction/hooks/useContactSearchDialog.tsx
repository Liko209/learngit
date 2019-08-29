import { GroupSearch } from '@/modules/common/container/GroupSearch/GroupSearch';
import { Dialog } from '@/containers/Dialog';
import React, { useCallback } from 'react';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { SortableModel } from 'sdk/src/framework/model';
import { Group } from 'sdk/module/group';
import { SortUtils } from 'sdk/framework/utils';

const searchFunc = async (searchKey: string) => {
  const searchService = ServiceLoader.getInstance<SearchService>(
    ServiceConfig.SEARCH_SERVICE,
  );
  const sortFunc = (a: SortableModel<Group>, b: SortableModel<Group>) => {
    if (a.sortWeights[0] > b.sortWeights[0]) {
      return -1;
    }

    if (a.sortWeights[0] < b.sortWeights[0]) {
      return 1;
    }

    const mostRecentA = a.entity.most_recent_post_created_at || 0;
    const mostRecentB = b.entity.most_recent_post_created_at || 0;
    if (mostRecentA > mostRecentB) {
      return -1;
    }

    if (mostRecentA < mostRecentB) {
      return 1;
    }

    return SortUtils.compareLowerCaseString(a.lowerCaseName, b.lowerCaseName);
  };

  const result = await searchService.doFuzzySearchPersonsAndGroups(
    searchKey,
    {
      excludeSelf: false,
      fetchAllIfSearchKeyEmpty: false,
      meFirst: true,
      recentFirst: !!searchKey,
    },
    {
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      meFirst: true,
      recentFirst: !!searchKey,
    },
    searchKey ? undefined : sortFunc,
  );

  return result.sortableModels;
};

const useContactSearchDialog = (
  selectHandler: (...args: any[]) => any,
  dependency: any[],
) => {
  const onSelect = useCallback(selectHandler, dependency);
  const openDialog = useCallback(() => {
    const { dismiss } = Dialog.simple(
      <GroupSearch
        onSelect={onSelect}
        dialogTitle="shareFile.dialogTitle"
        listTitle="groupSearch.listTitle"
        searchFunc={searchFunc}
      />,
      {
        size: 'small',
        onClose: () => dismiss(),
        disableBackdropClick: true,
      },
    );
  }, [onSelect]);
  return [openDialog];
};
export { useContactSearchDialog };
