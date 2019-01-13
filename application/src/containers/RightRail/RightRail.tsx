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

type TriggerButtonProps = {
  isOpen: boolean;
  onClick: () => {};
} & WithNamespaces;

class TriggerButtonComponent extends React.Component<TriggerButtonProps> {
  private _getTooltipKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'conversationDetailsHide' : 'conversationDetailsShow';
  }

  private _getIconKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'chevron_right' : 'chevron_left';
  }

  render() {
    const { t, onClick } = this.props;
    return (
      <JuiRightShelfHeaderIcon>
        <JuiIconButton
          tooltipTitle={t(this._getTooltipKey())}
          ariaLabel={t(this._getTooltipKey())}
          onClick={onClick}
        >
          {this._getIconKey()}
        </JuiIconButton>
      </JuiRightShelfHeaderIcon>
    );
  }
}

class RightRailComponent extends React.Component<Props> {
  private _renderHeader = () => {
    const { t } = this.props;
    return (
      <JuiRightShelfHeader>
        <JuiRightShelfHeaderText>
          {t('conversationDetails')}
        </JuiRightShelfHeaderText>
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
const TriggerButton = translate('translations')(TriggerButtonComponent);

export { RightRail, TriggerButton };
