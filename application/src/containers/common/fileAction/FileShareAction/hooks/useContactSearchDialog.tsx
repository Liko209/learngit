import { GroupSearch } from '@/modules/common/container/GroupSearch/GroupSearch';
import { Dialog } from '@/containers/Dialog';
import React, { useCallback } from 'react'
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';

const searchFunc = async (searchKey: string) => {
  const searchService = ServiceLoader.getInstance<SearchService>(
    ServiceConfig.SEARCH_SERVICE,
  );
  const result = await searchService.doFuzzySearchPersonsAndGroups(searchKey, { excludeSelf: false, fetchAllIfSearchKeyEmpty: false, meFirst: true }, {
    myGroupsOnly: true,
    fetchAllIfSearchKeyEmpty: true,
    meFirst: true,
  });
  return result.sortableModels
}

const useContactSearchDialog = (selectHandler: (...args: any[]) => any, dependency: any[]) => {
  const onSelect = useCallback(selectHandler, dependency);
  const openDialog = useCallback(() => {
    const { dismiss } = Dialog.simple(
      <GroupSearch onSelect={onSelect} dialogTitle="shareFile.dialogTitle" listTitle="groupSearch.listTitle" searchFunc={searchFunc} />,
      {
        size: 'small',
        onClose: () => dismiss(),
        disableBackdropClick: true
      },
    );
  }, [onSelect])
  return [openDialog]
}
export { useContactSearchDialog }
