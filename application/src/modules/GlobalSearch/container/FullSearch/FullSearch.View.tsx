/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:16
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FullSearchViewProps } from './types';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { TAB_CONFIG, TabConfig } from './config';

type Props = FullSearchViewProps & WithTranslation;

@observer
class FullSearchViewComponent extends Component<Props> {
  render() {
    const { t, currentTab } = this.props;
    return (
      <JuiTabs defaultActiveIndex={currentTab}>
        {TAB_CONFIG.map(
          ({ title, container, automationID }: TabConfig, index: number) => {
            const Component = container;
            return (
              <JuiTab key={index} title={t(title)} automationId={automationID}>
                <Component />
              </JuiTab>
            );
          },
        )}
      </JuiTabs>
    );
  }
}

const FullSearchView = withTranslation('translations')(FullSearchViewComponent);

export { FullSearchView };
