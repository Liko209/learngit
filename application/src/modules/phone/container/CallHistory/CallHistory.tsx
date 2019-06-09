/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { PhoneHeader } from 'jui/pattern/Phone/PhoneHeader';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { CallHistoryTypes } from './types';
import { TabConfig, TAB_CONFIG } from './config';

@observer
class CallHistoryComp extends Component<WithTranslation> {
  render() {
    const { t } = this.props;
    return (
      <>
        <PhoneHeader
          title={t('phone.callhistory')}
          data-test-automation-id="CallHistoryPageHeader"
        />
        <PhoneWrapper>
          <JuiTabs
            forceFlex={true}
            position="center"
            defaultActiveIndex={CallHistoryTypes.All}
          >
            {TAB_CONFIG.map(
              (
                { title, container, automationID }: TabConfig,
                index: number,
              ) => {
                const Component = container;
                return (
                  <JuiTab
                    key={index}
                    title={t(title)}
                    automationId={automationID}
                  >
                    <Component />
                  </JuiTab>
                );
              },
            )}
          </JuiTabs>
        </PhoneWrapper>
      </>
    );
  }
}

const CallHistory = withTranslation('translations')(CallHistoryComp);

export { CallHistory };
