/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AllCallsViewProps, CallLogType, CallLogSourceType } from './types';
import { JuiEmptyPage } from 'jui/pattern/EmptyPage';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { ErrorPage } from '@/modules/common/container/ErrorPage';
import { DataList } from '@/modules/common/container/DataList';
import { analyticsCollector } from '@/AnalyticsCollector';
import { CallLogItem } from '../CallLogItem';
import {
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { HoverControllerBaseProps } from '@/modules/common/container/Layout/HoverController';
import {
  VOICE_MAIL_ITEM_HEIGHT,
  INITIAL_COUNT,
  CALL_HISTORY_USED_HEIGHT,
  LOADING_DELAY,
} from '../Voicemail/config';
import noCallLogImage from '../images/no-call.svg';
import noResultImage from '../images/no-result.svg';

type Props = WithTranslation & AllCallsViewProps & HoverControllerBaseProps;

@observer
class AllCallsViewComponent extends Component<Props> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: () => <JuiRightRailContentLoading delay={LOADING_DELAY} />,
    loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  private get _height() {
    const { height } = this.props;

    return height - CALL_HISTORY_USED_HEIGHT;
  }

  private get _noRowsRenderer() {
    const { t, filterFOCKey } = this.props;

    const message = filterFOCKey
      ? t('phone.noMatchesFound')
      : t('phone.noCallLogAvailable');

    const image = filterFOCKey ? noResultImage : noCallLogImage;

    return (
      <JuiEmptyPage
        data-test-automation-id="callHistoryEmptyPage"
        image={image}
        message={message}
        height={this._height}
      />
    );
  }

  private _renderItems() {
    const { listHandler, resetSelectIndex, width, isHover } = this.props;

    return listHandler.sortableListStore.getIds.map(
      (itemId: string, cellIndex: number) => (
        <CallLogItem
          didOpenMiniProfile={this._didOpenMiniProfile}
          id={itemId}
          key={itemId}
          onMouseLeave={resetSelectIndex}
          isHover={isHover(cellIndex)}
          onMouseOver={this.props.selectIndexChange(cellIndex)}
          width={width}
        />
      ),
    );
  }

  private _didOpenMiniProfile = () => {
    const source =
      this.props.type === CallLogType.All
        ? CallLogSourceType.All
        : CallLogSourceType.Missed;
    analyticsCollector.openMiniProfile(source);
  };

  componentDidMount() {
    if (this.props.type === CallLogType.All) {
      analyticsCollector.seeAllCalls();
    } else {
      analyticsCollector.seeMissedCalls();
    }
  }

  render() {
    const { listHandler, isError, onErrorReload, type } = this.props;

    return (
      <PhoneWrapper pageHeight={this._height} data-type={type}>
        {isError ? (
          <ErrorPage onReload={onErrorReload} height={this._height} />
        ) : (
          <DataList
            initialDataCount={INITIAL_COUNT}
            listHandler={listHandler}
            reverse
            InfiniteListProps={Object.assign(this._infiniteListProps, {
              height: this._height,
              noRowsRenderer: this._noRowsRenderer,
            })}
          >
            {this._renderItems()}
          </DataList>
        )}
      </PhoneWrapper>
    );
  }
}

const AllCallsView = withTranslation('translations')(AllCallsViewComponent);

export { AllCallsView };
