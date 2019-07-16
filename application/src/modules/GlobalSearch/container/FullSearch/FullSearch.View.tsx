/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:16
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FullSearchViewProps, TAB_TYPE } from './types';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiFullSearch } from 'jui/pattern/GlobalSearch';
import { TAB_CONFIG, TabConfig } from './config';
import history from '@/history';
import { UnregisterCallback } from 'history';
import { InputContext } from '../context';

type Props = FullSearchViewProps & WithTranslation;

@observer
class FullSearchViewComponent extends Component<Props> {
  private _unlisten: UnregisterCallback;
  static contextType = InputContext;

  componentDidMount() {
    this._unlisten = history.listen(location => {
      if (/^\/messages\/\d+$/.test(location.pathname)) {
        this.props.jumpToConversationCallback();
      }
    });

    this.context.current && this.context.current.focus();
  }

  componentWillUnmount() {
    this._unlisten && this._unlisten();

    this.props.resetSearchScope();
  }

  onChangeTab = (tab: TAB_TYPE) => {
    const { setCurrentTab } = this.props;
    setCurrentTab(tab);
  };
  /* eslint-disable react/no-array-index-key */
  render() {
    const { t, currentTab } = this.props;
    return (
      <JuiFullSearch>
        <JuiTabs defaultActiveIndex={currentTab} onChangeTab={this.onChangeTab}>
          {TAB_CONFIG.map(({ title, container, automationID }: TabConfig, index: number) => {
            const Component = container;
            return (
              <JuiTab key={index} title={t(title)} automationId={automationID}>
                <Component isShow={index === currentTab} />
              </JuiTab>
            );
          })}
        </JuiTabs>
      </JuiFullSearch>
    );
  }
}

const FullSearchView = withTranslation('translations')(FullSearchViewComponent);

export { FullSearchView };
