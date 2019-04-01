/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
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
    const { t } = this.props;
    return (
      <JuiTabs defaultActiveIndex={0}>
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
