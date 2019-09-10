/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:35:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { observer, Observer } from 'mobx-react';
import ReactResizeDetector from 'react-resize-detector';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiRightShelf,
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
} from 'jui/pattern/RightShelf';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { ItemList, RIGHT_RAIL_ITEM_TYPE } from './ItemList';
import { TAB_CONFIG, TabConfig } from './ItemList/config';
import { PinnedList } from './PinnedList';
import { IMessageStore } from '@/modules/message/interface';
import { RightShelfMemberList } from '../RightShelfMemberList';
import { computed } from 'mobx';

type Props = {
  id: number;
  width: number;
  height: number;
  isShow: boolean;
} & WithTranslation;

type TriggerButtonProps = {
  isOpen: boolean;
  onClick: () => {};
} & WithTranslation;

type TriggerButtonState = {
  show: boolean;
};

// height of conversation header & tabs, pass these constant height to list;
// since resize observer in resize observer will cause UI performance issue.
const HEADER_HEIGHT = 48;
const HEIGHT_TABS = 33;
const MIN_TAB_WIDTH = 200;

const CONTAINER_IDS = {
  CONVERSATION_HEADER: 'conversation-header-right-wrapper',
  RIGHT_RAIL_HEADER: 'right-rail-header',
};

class TriggerButtonComponent extends React.Component<
  TriggerButtonProps,
  TriggerButtonState
> {
  @IMessageStore private _messageStore: IMessageStore;

  private _getTooltipKey = () => {
    const { isOpen } = this.props;
    return isOpen
      ? 'message.conversationDetailsHide'
      : 'message.conversationDetailsShow';
  };

  private _getIconKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'double_chevron_right' : 'double_chevron_left';
  };

  private _timerId: NodeJS.Timeout;

  state = {
    show: false,
  };

  constructor(props: TriggerButtonProps) {
    super(props);
    this._timerId = setTimeout(() => {
      this.setState({
        show: true,
      });
    }, 0);
  }

  componentDidMount() {
    this._onIsOpenUpdated();
  }

  componentDidUpdate() {
    this._onIsOpenUpdated();
  }

  componentWillUnmount() {
    if (this._timerId) {
      clearTimeout(this._timerId);
    }
  }

  _onIsOpenUpdated() {
    if (this._messageStore.isRightRailOpen !== this.props.isOpen) {
      this._messageStore.setIsRightRailOpen(this.props.isOpen);
    }
  }

  render() {
    const { show } = this.state;
    const { t, isOpen, onClick } = this.props;
    const container = document.getElementById(
      isOpen
        ? CONTAINER_IDS.RIGHT_RAIL_HEADER
        : CONTAINER_IDS.CONVERSATION_HEADER,
    );
    if (!container || !show) {
      return null;
    }
    return ReactDOM.createPortal(
      <JuiRightShelfHeaderIcon>
        <JuiIconButton
          tooltipTitle={t(this._getTooltipKey())}
          ariaLabel={t(this._getTooltipKey())}
          onClick={onClick}
          data-test-automation-id="right_rail_trigger_button"
        >
          {this._getIconKey()}
        </JuiIconButton>
      </JuiRightShelfHeaderIcon>,
      container,
    );
  }
}

@observer
class RightRailComponent extends React.Component<Props> {
  @computed
  private get _header () {
    const { t } = this.props;
    return (
      <JuiRightShelfHeader id="right-rail-header">
        <JuiRightShelfHeaderText>
          {t('message.conversationDetails')}
        </JuiRightShelfHeaderText>
      </JuiRightShelfHeader>
    );
  };

  private _renderListView = (
    type: RIGHT_RAIL_ITEM_TYPE,
    id: number,
    width: number,
    height: number,
  ) => {
    if (type === RIGHT_RAIL_ITEM_TYPE.PIN_POSTS) {
      return <PinnedList groupId={id} width={width} height={height} />;
    }
    return <ItemList type={type} groupId={id} width={width} height={height} />;
  };

  /* eslint-disable react/no-array-index-key */
  private _renderTabs = () => {
    const { t, id } = this.props;
    return (
      <ReactResizeDetector handleWidth handleHeight>
        {({ width: w, height: h }: { width: number; height: number }) => {
          const width =
            Number.isNaN(w) || typeof w === 'undefined' ? MIN_TAB_WIDTH : w;
          const height =
            Number.isNaN(h) || typeof w === 'undefined' ? HEIGHT_TABS : h;
          return (
            <Observer>
              {() => (
                <JuiTabs
                  defaultActiveIndex={0}
                  tag="right-shelf"
                  width={w}
                  moreText={t('common.more')}
                >
                  {TAB_CONFIG.map(
                    (
                      { title, type, automationID }: TabConfig,
                      index: number,
                    ) => (
                      <JuiTab
                        key={index}
                        title={t(title)}
                        automationId={`right-shelf-${automationID}`}
                      >
                        {this._renderListView(
                          type,
                          id,
                          width,
                          height - HEIGHT_TABS - HEADER_HEIGHT,
                        )}
                      </JuiTab>
                    ),
                  )}
                </JuiTabs>
              )}
            </Observer>
          );
        }}
      </ReactResizeDetector>
    );
  };

  render() {
    const { id, isShow } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiRightShelf data-test-automation-id="rightRail">
        {this._header}
        {isShow && <RightShelfMemberList groupId={id} />}
        {isShow && this._renderTabs()}
      </JuiRightShelf>
    );
  }
}

const RightRail = withTranslation('translations')(RightRailComponent);
const TriggerButton = withTranslation('translations')(TriggerButtonComponent);

export { RightRail, TriggerButton };
