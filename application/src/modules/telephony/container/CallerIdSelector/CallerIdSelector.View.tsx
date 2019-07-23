/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:25:27
 * Copyright © RingCentral. All rights reserved.
 */

/* eslint-disable */
import React, { PureComponent, createRef, ChangeEvent } from 'react';
import { JuiBoxSelect } from 'jui/components/Selects/BoxSelect';
import { JuiVirtualizedList } from 'jui/components/VirtualizedList';
import { HotKeys } from 'jui/hoc/HotKeys';
import { CallerIdItem } from './CallerIdItem';
import {
  CallerIdSelectorProps,
  CallerIdSelectorState,
  Direction,
  ICallerPhoneNumber,
  CallerIdViewProps,
} from './types';
import './styles.css';
import { LazyFormatPhone } from './LazyFormatPhone';
import { CallerIdContainer } from 'jui/pattern/Dialer';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { withTranslation, WithTranslation } from 'react-i18next';

const MENU_PADDING = 2;
const MIN_ROW_HEIGHT = 32;
const INITIAL_PAGE_SIZE = 416 / 32;
const LIST_CLASS_NAME = 'caller_id-list-container';

const styleProp = {
  classes: { paper: LIST_CLASS_NAME },
};

class RawCallerIdSelector extends PureComponent<
  CallerIdSelectorProps,
  CallerIdSelectorState
> {
  private _listRef: React.RefObject<any> = createRef();
  private _containerRef: React.RefObject<any> = createRef();
  private _startIndex: number;
  private _stopIndex: number;
  private _height = 416 - MENU_PADDING * 4;

  state = {
    height: 0,
    focusIndex:
      this.props.menu.findIndex(
        item => item.phoneNumber === this.props.value,
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
  };

  private _handleVisibilityChanged = async (range: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const { startIndex, stopIndex } = range;
    this._startIndex = startIndex;
    this._stopIndex = stopIndex;
  };

  private _scrollToView = (f: () => number) => () => {
    const next = f();

    if (
      (next < this._startIndex || next >= this._stopIndex) &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(next);
    }
  };

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
    this._onSelect(this.state.focusIndex);
  };

  private _onSelect = (idx: number) => {
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
  };

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
  };

  private _keyMap = {
    up: this._onUpKeyDown,
    down: this._onDownKeyDown,
    enter: this._onEnter,
  };

  private _cachedClickCallBacks: (() => void)[] = [];

  private _onClickFactory = (idx: number) => {
    if (!this._cachedClickCallBacks[idx]) {
      this._cachedClickCallBacks[idx] = () => this._onSelect(idx);
    }
    return this._cachedClickCallBacks[idx];
  };

  render() {
    const { menu, renderValue, ...rest } = this.props;
    const { focusIndex } = this.state;

    return (
      <JuiBoxSelect
        {...rest}
        automationId="caller-id-selector"
        renderValue={renderValue}
        MenuProps={styleProp}
        ref={this._containerRef}
      >
        {menu.length > INITIAL_PAGE_SIZE
          ? [
              <HotKeys keyMap={this._keyMap} key={LIST_CLASS_NAME}>
                <JuiVirtualizedList
                  height={this._height}
                  minRowHeight={MIN_ROW_HEIGHT}
                  initialScrollToIndex={focusIndex}
                  ref={this._listRef}
                  onVisibleRangeChange={this._handleVisibilityChanged}
                >
                  {this.props.menu.map((item: ICallerPhoneNumber, idx) => (
                    <CallerIdItem
                      {...item}
                      key={item.phoneNumber}
                      onClick={this._onClickFactory(idx)}
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

const CallerIdSelectorWithLazyFormat = CallerIdContainer(
  React.forwardRef((props: CallerIdSelectorProps, ref) => (
    <RawCallerIdSelector
      {...props}
      ref={ref as any}
      renderValue={(i: any) => <LazyFormatPhone value={i} />}
    />
  )),
);

const CallerIdSelector = withTranslation('translations')(
  ({ tooltipProps, callerIdProps, t }: CallerIdViewProps & WithTranslation) => {
    return (
      <RuiTooltip
        placement="bottom"
        {...tooltipProps}
        title={t('telephony.callerIdSelector.tooltip')}
      >
        <CallerIdSelectorWithLazyFormat
          {...callerIdProps}
          heightSize="default"
          label={t('telephony.callFrom')}
        />
      </RuiTooltip>
    );
  },
);

export {
  CallerIdSelector,
  CallerIdSelectorProps,
  RawCallerIdSelector,
  CallerIdSelectorWithLazyFormat,
};
