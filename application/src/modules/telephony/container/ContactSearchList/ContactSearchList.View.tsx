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
import { JuiList } from 'jui/components/Lists';
import { typography, grey, spacing } from 'jui/foundation/utils';
import { ContactSearchListViewProps } from './types';
import { observer } from 'mobx-react';
import { ContactSearchItem } from '../ContactSearchItem';
import { HotKeys } from 'jui/hoc/HotKeys';
import { ROW_HEIGHT } from './constants';

type Props = WithTranslation & ContactSearchListViewProps;
type ContactSearchListState = {
  height: number;
};

const MENU_PADDING = 2;

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

  state = {
    height: 0,
  };

  componentDidMount() {
    /* eslint-disable react/no-find-dom-node */
    const container = ReactDOM.findDOMNode(this._containerRef.current);
    if (container) {
      this.setState({
        height:
          (container as HTMLDivElement).offsetHeight - MENU_PADDING * 4 * 2,
      });
    }
  }
  componentDidUpdate({ trimmedInputString }: Props) {
    if (
      this.props.trimmedInputString !== trimmedInputString &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(0);
    }
  }
  private _scrollToView = (f: () => void) => () => {
    const { dialerInputFocused } = this.props;
    if (!dialerInputFocused) {
      return;
    }
    f();
    const newFS = this.props.focusIndex;
    const { startIndex, stopIndex } = this._listRef.current.getVisibleRange();
    if (this._listRef.current) {
      if (newFS <= startIndex) {
        this._listRef.current.scrollToIndex(newFS, false);
      } else if (newFS >= stopIndex) {
        this._listRef.current.scrollToIndex(newFS, true);
      }
    }
  };

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
      <ContactSearchListContainer
        ref={this._containerRef}
        className="contact-search-list-container"
      >
        {hasResult ? (
          <HotKeys
            keyMap={{
              up: this.onUpKeyDown,
              down: this.onDownKeyDown,
              enter: onEnter,
            }}
            global
          >
            <StyledList data-test-automation-id="telephony-contact-search-list">
              <JuiInfiniteList
                height={this.state.height}
                minRowHeight={ROW_HEIGHT}
                loadMore={loadMore}
                loadInitialData={loadInitialData}
                hasMore={hasMore}
                initialScrollToIndex={focusIndex === -1 ? 0 : focusIndex}
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
                      itemIndex={idx}
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
