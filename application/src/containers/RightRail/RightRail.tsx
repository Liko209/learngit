/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:35:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiRightShelf,
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
} from 'jui/pattern/RightShelf';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { ItemList } from './ItemList';
import { ITEM_LIST_TYPE } from './types';
import ReactResizeDetector from 'react-resize-detector';

type States = {
  isOpen: boolean;
};

type Props = {
  id: number;
} & WithNamespaces;

const TAB_CONFIG = [
  {
    title: 'pinned',
    type: ITEM_LIST_TYPE.PIN,
  },
  {
    title: 'files',
    type: ITEM_LIST_TYPE.FILE,
  },
  {
    title: 'images',
    type: ITEM_LIST_TYPE.IMAGE,
  },
  {
    title: 'tasks',
    type: ITEM_LIST_TYPE.TASK,
  },
  {
    title: 'links',
    type: ITEM_LIST_TYPE.LINK,
  },
  {
    title: 'notes',
    type: ITEM_LIST_TYPE.NOTE,
  },
  {
    title: 'events',
    type: ITEM_LIST_TYPE.EVENT,
  },
  {
    title: 'integrations',
    type: ITEM_LIST_TYPE.INTEGRATION,
  },
];

class RightRailComponent extends React.Component<Props, States> {
  state = {
    isOpen: true,
  };

  handleExpandAndCollapse = () => {
    this.setState((prevState: States) => ({
      isOpen: !prevState.isOpen,
    }));
  }

  private _getTooltipKey = () => {
    const { isOpen } = this.state;
    return isOpen ? 'conversationDetailsHide' : 'conversationDetailsShow';
  }

  private _getIconKey = () => {
    const { isOpen } = this.state;
    return isOpen ? 'chevron_right' : 'chevron_left';
  }

  private _renderHeader = () => {
    const { t } = this.props;
    return (
      <JuiRightShelfHeader>
        <JuiRightShelfHeaderText>
          {t('conversationDetails')}
        </JuiRightShelfHeaderText>
        <JuiRightShelfHeaderIcon>
          <JuiIconButton
            tooltipTitle={t(this._getTooltipKey())}
            ariaLabel={t(this._getTooltipKey())}
            onClick={this.handleExpandAndCollapse}
          >
            {this._getIconKey()}
          </JuiIconButton>
        </JuiRightShelfHeaderIcon>
      </JuiRightShelfHeader>
    );
  }

  private _renderTabs = () => {
    const { t, id } = this.props;
    return (
      <ReactResizeDetector handleWidth={true}>
        {(width: number) => (
          <JuiTabs defaultActiveIndex={0} tag="rightShelf" width={width}>
            {TAB_CONFIG.map(
              (
                { title, type }: { title: string; type: ITEM_LIST_TYPE },
                index: number,
              ) => (
                <JuiTab key={index} title={t(title)}>
                  <ItemList type={type} groupId={id} />
                </JuiTab>
              ),
            )}
          </JuiTabs>
        )}
      </ReactResizeDetector>
    );
  }

  render() {
    const { id } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiRightShelf data-test-automation-id="rightRail">
        {this._renderHeader()}
        {this._renderTabs()}
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);

export { RightRail };
