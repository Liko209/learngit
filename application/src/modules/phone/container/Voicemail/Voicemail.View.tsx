/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer, Observer } from 'mobx-react';
import ReactResizeDetector from 'react-resize-detector';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { JuiEmptyPage } from 'jui/pattern/EmptyPage';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { ErrorPage } from '@/modules/common/container/ErrorPage';
import { DataList } from '@/modules/common/container/DataList';
import {
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { analyticsCollector } from '@/AnalyticsCollector';
import { VoicemailViewProps } from './types';
import { VoicemailItem } from '../VoicemailItem';
import {
  VOICE_MAIL_ITEM_HEIGHT,
  INITIAL_COUNT,
  LOADING_DELAY,
  VOICEMAIL_HEADER,
} from './config';
import noVoicemailImage from '../images/no-voicemail.svg';

type Props = VoicemailViewProps & WithTranslation;

@observer
class VoicemailWrapper extends Component<Props & { height: number }> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: <JuiRightRailContentLoading delay={LOADING_DELAY * 0} />,
    loadingMoreRenderer: <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  private get _height() {
    const { height } = this.props;

    return height - VOICEMAIL_HEADER;
  }

  private get _noRowsRenderer() {
    const { t } = this.props;

    return (
      <JuiEmptyPage
        data-test-automation-id="voicemailEmptyPage"
        image={noVoicemailImage}
        message={t('phone.noVoicemailAvailable')}
        height={this._height}
      />
    );
  }

  private _renderItems() {
    const { listHandler } = this.props;
    return listHandler.sortableListStore.getIds.map((itemId: number) => {
      return <VoicemailItem key={itemId} id={itemId} />;
    });
  }

  render() {
    const { t, listHandler, isError, onErrorReload } = this.props;

    return (
      <>
        <JuiConversationPageHeader
          title={t('phone.voicemail')}
          data-test-automation-id="VoicemailPageHeader"
        />
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
      </>
    );
  }
}

@observer
class VoicemailComp extends Component<Props> {
  componentDidMount() {
    analyticsCollector.seeVoicemailListPage();
  }

  render() {
    return (
      <ReactResizeDetector handleHeight={true}>
        {({ height }: { height: number }) => (
          <Observer>
            {() => <VoicemailWrapper height={height} {...this.props} />}
          </Observer>
        )}
      </ReactResizeDetector>
    );
  }
}

const VoicemailView = withTranslation('translations')(VoicemailComp);

export { VoicemailView };
