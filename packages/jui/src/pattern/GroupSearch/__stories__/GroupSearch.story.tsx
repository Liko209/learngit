/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-19 11:34:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiGroupSearch } from '../GroupSearch';
import { JuiDialog } from '../../../components/Dialog';
import _ from 'lodash';
import { JuiListItem } from '../../../components/Lists';
import { JuiInfiniteList } from '../../../components/VirtualizedList';
import { withAutoSizer } from '../../../components/AutoSizer';

const sleep = function(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const loadInitialData = async () => {};
const loadMore = async () => [];
const hasMore = async () => false;
const InfiniteListDemo = (props: any) => {
  return (
    <JuiInfiniteList
      fixedRowHeight={34}
      loadInitialData={loadInitialData}
      loadMore={loadMore}
      hasMore={hasMore}
      highlightedIndex={props.highlightedIndex}
      {...props}
    >
      {_.range(0, 20).map((k: number) => (
        <JuiListItem
          key={k}
          highlighted={k === props.highlightedIndex}
          {...props.getItemProps({ index: k, item: { id: k } })}
        >
          list item {k}
        </JuiListItem>
      ))}
    </JuiInfiniteList>
  );
};

const InfiniteListDemoWithSize = withAutoSizer(InfiniteListDemo);
function GroupSearch() {
  const [key, setKey] = useState('');

  const onChange = (e: React.ChangeEvent<any>) => {
    setKey(e.target.value);
  };

  const onSelectChange = (e: any) => {
    setKey(`item ${e.id}`);
  };

  return (
    <JuiDialog size="small" open>
      <JuiGroupSearch
        dialogTitle="Switch conversation"
        searchPlaceHolder="Type person or team name"
        listTitle="Recent conversations"
        onClear={() => {
          setKey('');
        }}
        searchKey={key}
        onInputChange={onChange}
        onSelectChange={onSelectChange}
        clearText="clear"
        closeIconAriaLabel="close-icon"
        closeIconTooltip="close"
        onDialogClose={() => {}}
        itemCount={3}
        onKeyDownEscape={() => {}}
        itemToString={() => ''}
      >
        {({ highlightedIndex, getItemProps }) => {
          return (
            <InfiniteListDemoWithSize
              getItemProps={getItemProps}
              highlightedIndex={highlightedIndex}
            />
          );
        }}
      </JuiGroupSearch>
    </JuiDialog>
  );
}
storiesOf('Pattern/GroupSearch', module).add('groupSearch', () => (
  <GroupSearch />
));
