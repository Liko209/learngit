import { GroupSearch } from '@/modules/common/container/GroupSearch/GroupSearch';
import { Dialog } from '@/containers/Dialog';
import React, { useCallback } from 'react'
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';

const searchFunc = async (searchKey: string) => {
  const searchService = ServiceLoader.getInstance<SearchService>(
    ServiceConfig.SEARCH_SERVICE,
  );
  const result = await searchService.doFuzzySearchPersonsAndGroups(searchKey, { excludeSelf: false, fetchAllIfSearchKeyEmpty: false }, {
    myGroupsOnly: true,
    fetchAllIfSearchKeyEmpty: true,
  });
  return result
}
const useContactSearchDialog = (selectHandler: (...args: any[]) => any, dependency: any[]) => {
  const onSelect = useCallback(selectHandler, dependency);
  const openDialog = useCallback(() => {
    Dialog.simple(
      <GroupSearch onSelect={onSelect} dialogTitle="shareFile.dialogTitle" listTitle="groupSearch.listTitle" searchFunc={searchFunc} />,
      {
        size: 'small',
        enableEscapeClose: true,
      },
    );
    return false;
  }, [onSelect])
  return [openDialog]
}
export { useContactSearchDialog }
