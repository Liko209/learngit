import { GroupSearch } from '@/modules/common/container/GroupSearch/GroupSearch';
import { Dialog } from '@/containers/Dialog';
import React, { useCallback } from 'react';
import { searchFunc } from '@/modules/common/container/GroupSearch/lib';

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
        searchFunc={key => searchFunc(key, true)}
        defaultList={() => searchFunc('', true)}
      />,
      {
        size: 'small',
        onClose: () => dismiss(),
        disableBackdropClick: false,
      },
    );
  }, [onSelect]);
  return [openDialog];
};
export { useContactSearchDialog };
