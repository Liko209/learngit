/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, useState } from 'react';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { PhoneHeader } from 'jui/pattern/Phone/PhoneHeader';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer, Observer } from 'mobx-react';
import { debounce } from 'lodash';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiPhoneFilter } from 'jui/pattern/Phone/Filter';
import { CallHistoryTypes, CallHistoryViewProps, IUseFilter } from './types';
import { TabConfig, TAB_CONFIG } from './config';
import ReactResizeDetector from 'react-resize-detector';
import { More } from '../Actions/More';
import { DeleteAll } from '../Actions/DeleteAll';

const DELAY_DEBOUNCE = 300;

const useFilter: IUseFilter = (initial: string) => {
  const [value, setValue] = useState(initial);

  const setFilterValue = debounce(setValue, DELAY_DEBOUNCE);

  return [value, setFilterValue];
};

const CallHistoryWrapper = (
  props: { height: number; clearUMI: () => void } & WithTranslation,
) => {
  const { t } = props;

  const [filterValue, setFilterValue] = useFilter('');

  const clearUmi = (index: number) => {
    if (index === CallHistoryTypes.Missed) {
      props.clearUMI();
    }
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
        Right={
          <JuiPhoneFilter
            placeholder={t('calllog.inputFilter')}
            clearButtonLabel={t('calllog.clearFilter')}
            onChange={setFilterValue}
          />
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
                  <Component height={props.height} filterValue={filterValue} />
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
      <ReactResizeDetector handleHeight={true}>
        {({ height }: { height: number }) => (
          <Observer>
            {() => (
              <CallHistoryWrapper
                clearUMI={this.props.clearUMI}
                height={height}
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
