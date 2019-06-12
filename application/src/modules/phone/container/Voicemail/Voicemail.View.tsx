/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { JuiEmptyScreen } from 'jui/pattern/Phone/EmptyScreen';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { observer, Observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DataList } from '@/modules/common/container/DataList';
import ReactResizeDetector from 'react-resize-detector';
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
  TOP_BAR_HEIGHT,
  LOADING_DELAY,
  VOICEMAIL_HEADER,
} from './config';

type Props = VoicemailViewProps & WithTranslation;

type State = {
  height: number;
};

@observer
class VoicemailComp extends Component<Props, State> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: <JuiRightRailContentLoading delay={LOADING_DELAY * 0} />,
    loadingMoreRenderer: <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  state = {
    height: 0,
  };

  componentDidMount() {
    analyticsCollector.seeVoicemailListPage();
  }

  private _renderItems() {
    const { listHandler } = this.props;
    return listHandler.sortableListStore.getIds.map((itemId: number) => {
      return <VoicemailItem key={itemId} id={itemId} />;
    });
  }

  render() {
    const { t, listHandler } = this.props;
    return (
      <>
        <JuiConversationPageHeader
          title={t('phone.voicemail')}
          data-test-automation-id="VoicemailPageHeader"
        />
        <ReactResizeDetector handleHeight={true}>
          {({ height }: { height: number }) => (
            <Observer>
              {() => (
                <PhoneWrapper>
                  <DataList
                    initialDataCount={INITIAL_COUNT}
                    listHandler={listHandler}
                    reverse={true}
                    InfiniteListProps={Object.assign(this._infiniteListProps, {
                      height: height - TOP_BAR_HEIGHT - VOICEMAIL_HEADER,
                      noRowsRenderer: (
                        <JuiEmptyScreen
                          text={t('phone.noVoicemailAvailable')}
                        />
                      ),
                    })}
                  >
                    {this._renderItems()}
                  </DataList>
                </PhoneWrapper>
              )}
            </Observer>
          )}
        </ReactResizeDetector>
      </>
    );
  }
}

const VoicemailView = withTranslation('translations')(VoicemailComp);

export { VoicemailView };
