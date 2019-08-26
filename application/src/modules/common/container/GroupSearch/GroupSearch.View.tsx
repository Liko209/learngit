/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:15:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiGroupSearch } from 'jui/pattern/GroupSearch';
import { GroupSearchViewProps } from './types';
import portalManager from '@/common/PortalManager';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';
import { withAutoSizer } from 'jui/components/AutoSizer';
import { JuiVirtualizedList, IndexRange } from 'jui/components/VirtualizedList';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import { GetItemPropsOptions } from 'downshift';
import moize from 'moize';
import { UniversalAvatar } from '@/containers/Avatar/UniversalAvatar';
import { JuiEmptyScreen } from 'jui/pattern/GlobalSearch/EmptyScreen';
import { withTranslation, WithTranslation } from 'react-i18next';

const ITEM_HEIGHT = 48;

const VirtualizedListWithAutoSizer = withAutoSizer(JuiVirtualizedList);

const getItemPropsMap = {};
class GroupSearchViewComponent extends React.Component<
  GroupSearchViewProps & WithTranslation
> {
  state = {
    renderedRange: { startIndex: 0, stopIndex: 0 },
    searchKey: '',
  };

  componentDidMount() {
    this.props.searchGroups('');
  }

  private _handleChange = (e: React.ChangeEvent<any>) => {
    this.setState({ searchKey: e.target.value });
    this.props.searchGroups(e.target.value);
  };

  private _handleSelectChange = (e: { id: number }) => {
    this.props.onSelectChange(e);
  };

  private _handleClose = () => {
    portalManager.dismissLast();
  };

  private _renderAvatar = moize(id => {
    return <UniversalAvatar id={id} />;
  });

  private _renderItem = (
    getItemProps: (options: GetItemPropsOptions<any>) => any,
    id: number,
    index: number,
    isHighlighted: boolean,
  ) => {
    getItemPropsMap[index] = getItemProps;
    if (
      this.state.renderedRange.startIndex <= index &&
      index <= this.state.renderedRange.stopIndex
    ) {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PERSON) ? (
        <ContactSearchItem
          itemId={id}
          key={index}
          isHighlighted={isHighlighted}
          {...getItemProps({ index, item: { id } })}
        />
      ) : (
        <GroupSearchItem
          itemId={id}
          key={index}
          isHighlighted={isHighlighted}
          avatar={this._renderAvatar(id)}
          {...getItemProps({ index, item: { id } })}
        />
      );
    }

    return { key: id || 0 };
  };

  private _handleRenderedRangeChange = (renderedRange: IndexRange) => {
    this.setState({ renderedRange });
  };

  private _handleClear = () => {
    this.setState({ searchKey: '' });
    this.props.searchGroups('');
  };

  render() {
    const { list, t, size } = this.props;
    return (
      <JuiGroupSearch
        dialogTitle={t('groupSearch.dialogTitle')}
        searchPlaceHolder={t('groupSearch.inputGhostText')}
        listTitle={t('groupSearch.listTitle')}
        onClear={this._handleClear}
        searchKey={this.state.searchKey}
        onInputChange={this._handleChange}
        onSelectChange={this._handleSelectChange}
        clearText={t('globalSearch.clear')}
        closeIconAriaLabel="close-icon"
        closeIconTooltip={t('common.dialog.close')}
        onDialogClose={this._handleClose}
        itemCount={this.props.size}
        onKeyDownEscape={this._handleClose}
      >
        {({ highlightedIndex, getItemProps }) => {
          return size === 0 ? (
            <JuiEmptyScreen
              imgWidth={60}
              textVariant="subheading1"
              text={t('globalSearch.NoMatchesFound')}
            />
          ) : (
            <VirtualizedListWithAutoSizer
              onRenderedRangeChange={this._handleRenderedRangeChange}
              fixedRowHeight={ITEM_HEIGHT}
              highlightedIndex={highlightedIndex || 0}
              overscan={2}
            >
              {list.map((id, index) =>
                this._renderItem(
                  getItemProps,
                  id,
                  index,
                  index === highlightedIndex,
                ),
              )}
            </VirtualizedListWithAutoSizer>
          );
        }}
      </JuiGroupSearch>
    );
  }
}

const GroupSearchView = withTranslation('translations')(
  GroupSearchViewComponent,
);

export { GroupSearchView };
