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
  VOICE_MAIL_ITEM_HEIGHT,
  INITIAL_COUNT,
  CALL_HISTORY_USED_HEIGHT,
} from '../Voicemail/config';
import noCallLogImage from '../images/no-call.svg';

type Props = WithTranslation & AllCallsViewProps;

@observer
class AllCallsViewComponent extends Component<Props> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: <div />, // TODO add loading
    loadingMoreRenderer: <div />, // TODO add loading more
    stickToLastPosition: false,
  };

  private get _height() {
    const { height } = this.props;

    return height - CALL_HISTORY_USED_HEIGHT;
  }

  private get _noRowsRenderer() {
    const { t } = this.props;

    return (
      <JuiEmptyPage
        image={noCallLogImage}
        message={t('phone.noCallLogAvailable')}
        height={this._height}
      />
    );
  }

  private _renderItems() {
    const { listHandler } = this.props;
    return listHandler.sortableListStore.getIds.map((itemId: string) => {
      return (
        <CallLogItem
          didOpenMiniProfile={this._didOpenMiniProfile}
          id={itemId}
          key={itemId}
        />
      );
    });
  }

  private _didOpenMiniProfile = () => {
    const source =
      this.props.type === CallLogType.All
        ? CallLogSourceType.All
        : CallLogSourceType.Missed;
    analyticsCollector.openMiniProfile(source);
  }

  componentDidMount() {
    if (this.props.type === CallLogType.All) {
      analyticsCollector.seeAllCalls();
    } else {
      analyticsCollector.seeMissedCalls();
    }
  }

  render() {
    const { listHandler, isError, onErrorReload } = this.props;

    return (
      <PhoneWrapper>
        {isError ? (
          <ErrorPage onReload={onErrorReload} height={this._height} />
        ) : (
          <DataList
            initialDataCount={INITIAL_COUNT}
            listHandler={listHandler}
            reverse={true}
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
