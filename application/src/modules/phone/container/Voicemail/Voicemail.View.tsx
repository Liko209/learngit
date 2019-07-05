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
import { HoverControllerBaseProps } from '../HoverController';

const DELAY_DEBOUNCE = 300;

type Props = VoicemailViewProps & WithTranslation & HoverControllerBaseProps;

@observer
class VoicemailWrapper extends Component<Props & { height: number; width: number }> {
  private _infiniteListProps = {
    minRowHeight: VOICE_MAIL_ITEM_HEIGHT,
    loadingRenderer: () => <JuiRightRailContentLoading delay={LOADING_DELAY} />,
    loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  private get _height() {
    const { height } = this.props;

    return height - VOICEMAIL_HEADER;
  }

  private get _noRowsRenderer() {
    const { t, filterValue } = this.props;

    const message = filterValue
      ? t('phone.noMatchesFound')
      : t('phone.noVoicemailAvailable');

    const image = filterValue ? noResultImage : noVoicemailImage;

    return (
      <JuiEmptyPage
        data-test-automation-id="voicemailEmptyPage"
        image={image}
        message={message}
        height={this._height}
      />
    );
  }

  private get _filterRenderer() {
    const { t } = this.props;

    return (
      <JuiPhoneFilter
        placeholder={t('voicemail.inputFilter')}
        clearButtonLabel={t('voicemail.clearFilter')}
        onChange={this._onFilterChange}
      />
    );
  }

  private _onFilterChange = debounce(this.props.onFilterChange, DELAY_DEBOUNCE);

  private _renderItems() {
    const { listHandler, resetSelectIndex, width, isHover } = this.props;
    return listHandler.sortableListStore.getIds.map((itemId: number, cellIndex: number) => {
      return (
        <VoicemailItem
          id={itemId}
          key={itemId}
          width={width}
          onMouseLeave={resetSelectIndex}
          isHover={isHover(cellIndex)}
          onMouseOver={this.props.selectIndexChange(cellIndex)}
        />
      );
    });
  }

  render() {
    const { t, listHandler, isError, onErrorReload } = this.props;

    return (
      <>
        <JuiConversationPageHeader
          title={t('phone.voicemail')}
          data-test-automation-id="VoicemailPageHeader"
          Right={this._filterRenderer}
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
      <ReactResizeDetector handleHeight={true} handleWidth={true}>
        {({
          width: width,
          height: height,
        }: {
          width: number;
          height: number;
        }) => (
          <Observer>
            {() => (
              <VoicemailWrapper height={height} width={width} {...this.props} />
            )}
          </Observer>
        )}
      </ReactResizeDetector>
    );
  }
}

const VoicemailView = withTranslation('translations')(VoicemailComp);

export { VoicemailView };
