import { GroupSearch } from '@/modules/common/container/GroupSearch/GroupSearch';
import { Dialog } from '@/containers/Dialog';
import React, { useCallback } from 'react';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { SortableModel } from 'sdk/src/framework/model';
import { Group } from 'sdk/module/group';

const searchFunc = async (searchKey: string) => {
  const searchService = ServiceLoader.getInstance<SearchService>(
    ServiceConfig.SEARCH_SERVICE,
  );
  const sortFunc = (a: SortableModel<Group>, b: SortableModel<Group>) =>
    b.entity.most_recent_content_modified_at -
    a.entity.most_recent_content_modified_at;

  const result = await searchService.doFuzzySearchPersonsAndGroups(
    searchKey,
    {
      excludeSelf: false,
      fetchAllIfSearchKeyEmpty: false,
      meFirst: true,
    },
    {
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      meFirst: true,
      sortFunc,
    },
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
