/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { PhoneHeader } from 'jui/pattern/Phone/PhoneHeader';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer, Observer } from 'mobx-react';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { CallHistoryTypes, CallHistoryViewProps } from './types';
import { TabConfig, TAB_CONFIG } from './config';
import ReactResizeDetector from 'react-resize-detector';
import { More } from '../Actions/More';
import { DeleteAll } from '../Actions/DeleteAll';

const CallHistoryWrapper = (
  props: {
    height: number;
    width: number;
    clearUMI: () => void;
  } & WithTranslation,
) => {
  const clearUmi = () => {
    props.clearUMI();
  };

  return (
    <>
      <PhoneHeader
        title={props.t('phone.callhistory')}
        data-test-automation-id="CallHistoryPageHeader"
        SubTitle={
          <More automationId="callHistory-header-more">
            <DeleteAll />
          </More>
        }
      />
      <PhoneWrapper>
        <JuiTabs
          position="center"
          forceFlex={true}
          defaultActiveIndex={CallHistoryTypes.All}
          onChangeTab={clearUmi}
        >
          {TAB_CONFIG.map(
            ({ title, container, automationID }: TabConfig, index: number) => {
              const Component = container;
              return (
                <JuiTab
                  key={index}
                  title={props.t(title)}
                  automationId={automationID}
                >
                  <Component width={props.width} height={props.height} />
                </JuiTab>
              );
            },
          )}
        </JuiTabs>
      </PhoneWrapper>
    </>
  );
};
@observer
class CallHistoryComp extends Component<
  CallHistoryViewProps & WithTranslation
> {
  componentWillUnmount() {
    this.props.clearUMI();
  }

  render() {
    return (
      <ReactResizeDetector handleHeight={true} handleWidth={true}>
        {({ height, width }: { width: number; height: number }) => (
          <Observer>
            {() => (
              <CallHistoryWrapper
                clearUMI={this.props.clearUMI}
                height={height}
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

const CallHistoryView = withTranslation('translations')(CallHistoryComp);

export { CallHistoryView, CallHistoryWrapper };
