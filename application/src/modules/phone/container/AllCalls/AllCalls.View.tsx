/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:21
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AllCallsViewProps, CallLogType, CallLogSourceType } from './types';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { DataList } from '@/modules/common/container/DataList';
import { CallLogItem } from '../CallLogItem';
import { analyticsCollector } from '@/AnalyticsCollector';
import {
  VOICE_MAIL_ITEM_HEIGHT,
  INITIAL_COUNT,
  CALL_HISTORY_USED_HEIGHT,
} from '../Voicemail/config';

type Props = WithTranslation & AllCallsViewProps;

@observer
class AllCallsViewComponent extends Component<Props> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: <div />, // TODO add loading
    loadingMoreRenderer: <div />, // TODO add loading more
    stickToLastPosition: false,
  };

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
    const { listHandler, t, height } = this.props;

    return (
      <PhoneWrapper>
        <DataList
          initialDataCount={INITIAL_COUNT}
          listHandler={listHandler}
          reverse={true}
          InfiniteListProps={Object.assign(this._infiniteListProps, {
            height: height - CALL_HISTORY_USED_HEIGHT,
            noRowsRenderer: <div>{t('telephony.nocalllogs')}</div>, // TODO add empty page
          })}
        >
          {this._renderItems()}
        </DataList>
      </PhoneWrapper>
    );
  }
}

const AllCallsView = withTranslation('translations')(AllCallsViewComponent);

export { AllCallsView };
