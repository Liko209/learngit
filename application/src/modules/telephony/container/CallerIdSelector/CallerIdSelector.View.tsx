/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:25:27
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, createRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { JuiBoxSelect } from 'jui/components/Selects/BoxSelect';
import { spacing } from 'jui/foundation/utils';
import { JuiVirtualizedList } from 'jui/components/VirtualizedList';
import { HotKeys } from 'jui/hoc/HotKeys';
import { CallerIdItem } from './CallerIdItem';
import {
  CallerIdSelectorProps,
  CallerIdSelectorState,
  Direction,
  ICallerPhoneNumber,
} from './types';
import './styles.css';
import { LazyFormatPhone } from './LazyFormatPhone';

const MENU_PADDING = 2;
const MIN_ROW_HEIGHT = 32;
const INITIAL_PAGE_SIZE = 416 / 32;
const LIST_CLASS_NAME = 'caller_id-list-container';

class RawCallerIdSelector extends PureComponent<
  CallerIdSelectorProps,
  CallerIdSelectorState
> {
  private _listRef: React.RefObject<any> = createRef();
  private _containerRef: React.RefObject<any> = createRef();
  private _startIndex: number;
  private _stopIndex: number;

  state = {
    height: 0,
    focusIndex:
      this.props.menu.findIndex(
        (item) => item.phoneNumber === this.props.value,
      ) || 0,
    displayStartIdx: 0,
    displayEndIdx: 0,
  };

  private _getIdx = (idx: number, direction: Direction = Direction.DOWN) => {
    if (direction === Direction.DOWN) {
      const len = this.props.menu.length;
      const maxIdx = len === 0 ? 0 : len - 1;
      return idx >= maxIdx ? maxIdx : idx;
    }
    return idx <= 0 ? 0 : idx;
  }

  private _handleVisibilityChanged = async (range: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const { startIndex, stopIndex } = range;
    this._startIndex = startIndex;
    this._stopIndex = stopIndex;
  }

  private _scrollToView = (f: () => number) => () => {
    const next = f();

    if (
      (next < this._startIndex || next >= this._stopIndex) &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(next);
    }
  }

  private _onUpKeyDown = this._scrollToView(() => {
    const next = this.state.focusIndex - 1;
    const focusIndex = this._getIdx(next, Direction.UP);
    this.setState({
      focusIndex,
    });
    return focusIndex;
  });

  private _onDownKeyDown = this._scrollToView(() => {
    const next = this.state.focusIndex + 1;
    const focusIndex = this._getIdx(next, Direction.DOWN);
    this.setState({
      focusIndex,
    });
    return focusIndex;
  });

  private _onEnter = () => {
    const item = this._getDisplayList()[this.state.focusIndex];
    this._onSelect(item);
  }

  private _getDisplayList = () => {
    return this.props.menu;
  }

  private _onSelect = (item: ICallerPhoneNumber) => {
    const idx = this.props.menu.findIndex((el) => el === item);
    const target = this.props.menu[idx] as any;
    const evt = {
      target,
    } as ChangeEvent<HTMLSelectElement>;
    this.setState({
      focusIndex: idx,
    });
    this.props.onChange(evt);
    // HACK
    this._clickToHide();
  }

  private _clickToHide = () => {
    const listEl = document.getElementsByClassName(
      LIST_CLASS_NAME,
    )[0] as HTMLDivElement;
    if (!listEl) {
      return;
    }
    ((listEl.parentElement as HTMLDivElement)
      .firstChild as HTMLDivElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
  }

  render() {
    const { menu, renderValue, ...rest } = this.props;
    const { focusIndex } = this.state;

    return (
      <JuiBoxSelect
        {...rest}
        automationId="caller-id-selector"
        renderValue={renderValue}
        MenuProps={{
          classes: { paper: LIST_CLASS_NAME },
        }}
        ref={this._containerRef}
      >
        {menu.length > INITIAL_PAGE_SIZE
          ? [
              <HotKeys
                keyMap={{
                  up: this._onUpKeyDown,
                  down: this._onDownKeyDown,
                  enter: this._onEnter,
                }}
                key={LIST_CLASS_NAME}
              >
                <JuiVirtualizedList
                  height={416 - MENU_PADDING * 4}
                  minRowHeight={MIN_ROW_HEIGHT}
                  initialScrollToIndex={focusIndex}
                  ref={this._listRef}
                  onVisibleRangeChange={this._handleVisibilityChanged}
                >
                  {this.props.menu.map((item: ICallerPhoneNumber, idx) => (
                    <CallerIdItem
                      {...item}
                      key={item.phoneNumber}
                      onClick={() => {
                        this._onSelect(item);
                      }}
                      selected={
                        item.phoneNumber === this.props.value ||
                        idx === focusIndex
                      }
                    />
                  ))}
                </JuiVirtualizedList>
              </HotKeys>,
            ]
          : menu.map((item: ICallerPhoneNumber) => (
              <CallerIdItem {...item} key={item.phoneNumber} />
            ))}
      </JuiBoxSelect>
    );
  }
}

const CallerIdSelector = styled((props: CallerIdSelectorProps) => (
  <RawCallerIdSelector
    {...props}
    renderValue={(i: any) => <LazyFormatPhone value={i} />}
  />
))`
  && {
    position: absolute;
    top: ${spacing(1.5)};
    left: 0;
    right: 0;
    margin: auto;
    display: flex;
    flex-direction: horizontal;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    padding-bottom: 0;

    div:nth-of-type(1) {
      padding-bottom: 0;
    }
    div:nth-of-type(2) {
      background: transparent;
      border: none;
      width: auto;
      font-size: ${({ theme }) => theme.typography.caption2.fontSize};
      margin-right: ${spacing(-3)};

      & > div > div[role='button'] {
        padding: ${spacing(1.5, 4.5, 1.5, 1.5)};
        overflow: hidden;
        display: block;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
        max-width: ${spacing(36)};
      }
    }
  }
`;

export { CallerIdSelector, CallerIdSelectorProps, RawCallerIdSelector };
