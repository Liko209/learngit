/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer, Observer } from 'mobx-react';
import { debounce } from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { JuiPhoneFilter } from 'jui/pattern/Phone/Filter';
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
  VOICEMAIL_HEADER,
  LOADING_DELAY,
} from './config';
import noVoicemailImage from '../images/no-voicemail.svg';
import noResultImage from '../images/no-result.svg';
import { HoverControllerBaseProps } from '@/modules/common/container/Layout/HoverController';
import { DELAY_DEBOUNCE } from '../constants';

type Props = VoicemailViewProps & WithTranslation & HoverControllerBaseProps;

@observer
class VoicemailWrapper extends Component<
  Props & { height: number; width: number }
> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: () => <JuiRightRailContentLoading delay={LOADING_DELAY} />,
    loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  private get _noRowsRenderer() {
    const { t, filterFOCKey, height } = this.props;

    const message = filterFOCKey
      ? t('phone.noMatchesFound')
      : t('phone.noVoicemailAvailable');

    const image = filterFOCKey ? noResultImage : noVoicemailImage;

    return (
      <JuiEmptyPage
        data-test-automation-id="voicemailEmptyPage"
        image={image}
        message={message}
        height={height}
      />
    );
  }

  private get _filterRenderer() {
    const { t } = this.props;

    return (
      <JuiPhoneFilter
        placeholder={t('voicemail.inputFilter')}
        clearButtonLabel={t('voicemail.clearFilter')}
        tooltip={t('common.clear')}
        onChange={this._onFilterChange}
      />
    );
  }

  private _onFilterChange = debounce(this.props.onFilterChange, DELAY_DEBOUNCE);

  private _renderItems() {
    const {
      onVoicemailPlay,
      activeVoicemailId,
      listHandler,
      resetSelectIndex,
      width,
      isHover,
    } = this.props;

    return listHandler.sortableListStore.getIds.map(
      (itemId: number, cellIndex: number) => (
        <VoicemailItem
          id={itemId}
          key={itemId}
          width={width}
          activeVoicemailId={activeVoicemailId}
          onVoicemailPlay={onVoicemailPlay}
          onMouseLeave={resetSelectIndex}
          isHover={isHover(cellIndex)}
          onMouseOver={this.props.selectIndexChange(cellIndex)}
        />
      ),
    );
  }

  render() {
    const { t, listHandler, isError, onErrorReload, height } = this.props;

    return (
      <>
        <JuiConversationPageHeader
          title={t('phone.voicemail')}
          data-test-automation-id="VoicemailPageHeader"
          Right={this._filterRenderer}
        />
        <PhoneWrapper pageHeight={height}>
          {isError ? (
            <ErrorPage onReload={onErrorReload} height={height} />
          ) : (
            <DataList
              initialDataCount={INITIAL_COUNT}
              listHandler={listHandler}
              reverse
              InfiniteListProps={Object.assign(this._infiniteListProps, {
                height,
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
      <ReactResizeDetector handleHeight handleWidth>
        {({ width, height }: { width: number; height: number }) => (
          <Observer>
            {() => (
              <VoicemailWrapper
                height={height - VOICEMAIL_HEADER}
                width={width}
                {...this.props}
              />
            )}
          </Observer>
        )}
      </ReactResizeDetector>
    );
  }
}

const VoicemailView = withTranslation('translations')(VoicemailComp);

export { VoicemailView };
