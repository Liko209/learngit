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
import { DELAY_DEBOUNCE } from '../constants';

const useFilter: IUseFilter = (initial: string) => {
  const [value, setValue] = useState(initial);

  const setFilterValue = debounce(setValue, DELAY_DEBOUNCE);

  return [value, setFilterValue];
};

const CallHistoryWrapper = (
  props: {
    height: number;
    width: number;
    clearUMI: () => void;
  } & WithTranslation,
) => {
  const { t, clearUMI } = props;

  const [filterValue, setFilterValue] = useFilter('');

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
            tooltip={t('common.clear')}
          />
        }
      />
      <PhoneWrapper>
        <JuiTabs
          position="center"
          forceFlex
          defaultActiveIndex={CallHistoryTypes.All}
          onChangeTab={clearUMI}
        >
          {TAB_CONFIG.map(
            ({ title, container, automationID }: TabConfig, index: number) => {
              const Component = container;
              const key = `${automationID}_${index}`;
              return (
                <JuiTab
                  key={key}
                  title={props.t(title)}
                  automationId={automationID}
                >
                  <Component
                    width={props.width}
                    height={props.height}
                    filterValue={filterValue}
                  />
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
      <ReactResizeDetector handleHeight handleWidth>
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
