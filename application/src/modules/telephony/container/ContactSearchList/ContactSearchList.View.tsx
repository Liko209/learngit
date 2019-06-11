/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 10:34:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, createRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { JuiInfiniteList } from 'jui/components/VirtualizedList';
import { WithTranslation, withTranslation } from 'react-i18next';
import { JuiList } from 'jui/components';
import { typography, grey, spacing } from 'jui/foundation/utils';
import { ContactSearchListViewProps } from './types';
import { observer } from 'mobx-react';
import { ContactSearchItem } from '../ContactSearchItem';
import { HotKeys } from 'jui/hoc/HotKeys';

type Props = WithTranslation & ContactSearchListViewProps;
type ContactSearchListState = {
  height: number;
};

const MENU_PADDING = 2;
const ROW_HEIGHT = 44;

const ContactSearchListContainer = styled.div`
  flex: 1;
  width: 100%;
  text-align: center;
  ${typography('body1')};
  color: ${grey('700')};
  word-break: break-all;
`;

const StyledList = styled(JuiList)<{}>`
  && {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    padding: ${spacing(MENU_PADDING, 0)};
  }
`;

@observer
class ContactSearchListViewComponent extends Component<
  Props,
  ContactSearchListState
> {
  private _containerRef: React.RefObject<any> = createRef();
  private _listRef: React.RefObject<any> = createRef();
  private _startIndex: number;
  private _stopIndex: number;

  state = {
    height: 0,
    initialScrollToIndex: 0,
  };

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this._containerRef.current);
    if (container) {
      this.setState({
        height:
          (container as HTMLDivElement).offsetHeight - MENU_PADDING * 4 * 2,
      });
    }
  }

  private _handleVisibilityChanged = (range: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const { startIndex, stopIndex } = range;
    this._startIndex = startIndex;
    this._stopIndex = stopIndex;
  }

  private _scrollToView = (f: () => void) => () => {
    const { focusIndex, dialerFocused } = this.props;
    if (!dialerFocused) {
      return;
    }
    f();

    if (
      (focusIndex < this._startIndex || focusIndex >= this._stopIndex) &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(focusIndex);
    }
  }

  private onUpKeyDown = this._scrollToView(this.props.decreaseFocusIndex);

  private onDownKeyDown = this._scrollToView(this.props.increaseFocusIndex);

  render() {
    const {
      displayedSearchResult,
      t,
      isSearching,
      loadMore,
      loadInitialData,
      hasMore,
      focusIndex,
      onEnter,
      onClick,
    } = this.props;

    const hasResult = !!displayedSearchResult.length;

    return (
      <ContactSearchListContainer ref={this._containerRef}>
        {hasResult ? (
          <HotKeys
            keyMap={{
              up: this.onUpKeyDown,
              down: this.onDownKeyDown,
              enter: onEnter,
            }}
          >
            <StyledList data-test-automation-id="telephony-contact-search-list">
              <JuiInfiniteList
                height={this.state.height}
                minRowHeight={ROW_HEIGHT}
                loadMore={loadMore}
                loadInitialData={loadInitialData}
                loadingMoreRenderer={<></>}
                loadingRenderer={<></>}
                hasMore={hasMore}
                initialScrollToIndex={focusIndex === -1 ? 0 : focusIndex}
                onVisibleRangeChange={this._handleVisibilityChanged}
                ref={this._listRef}
              >
                {displayedSearchResult.map((searchItem, idx) => {
                  const { directDial, id, phoneNumber, person } = searchItem;
                  return (
                    <ContactSearchItem
                      key={`${id}-${directDial}`}
                      directDial={directDial}
                      phoneId={phoneNumber && phoneNumber.id}
                      personId={person && person.id}
                      selected={focusIndex === idx}
                      onClick={() => onClick(idx)}
                      phoneNumberType={
                        phoneNumber && phoneNumber.phoneNumberType
                      }
                    />
                  );
                })}
              </JuiInfiniteList>
            </StyledList>
          </HotKeys>
        ) : isSearching ? (
          t('telephony.searching')
        ) : (
          t('telephony.noMatch')
        )}
      </ContactSearchListContainer>
    );
  }
}

const ContactSearchListView = withTranslation('translations')(
  ContactSearchListViewComponent,
);

export { ContactSearchListView };
