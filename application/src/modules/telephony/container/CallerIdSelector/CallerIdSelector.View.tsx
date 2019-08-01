/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiVirtualizedBoxSelect } from 'jui/components/VirtualizedSelects';
import { CallerIdItem } from './CallerIdItem';
import {
  CallerIdSelectorProps,
  CallerIdSelectorState,
  ICallerPhoneNumber,
  CallerIdViewProps,
} from './types';
import './styles.css';
import { LazyFormatPhone } from './LazyFormatPhone';
import { CallerIdContainer } from 'jui/pattern/Dialer';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiMenuItem } from 'jui/components/Menus';

const style = {
  minWidth: 180,
  maxWidth: 288,
};

class RawCallerIdSelector extends PureComponent<
  CallerIdSelectorProps,
  CallerIdSelectorState
> {
  render() {
    const { menu, renderValue, ...rest } = this.props;
    return (
      <JuiVirtualizedBoxSelect
        {...rest}
        automationId="caller-id-selector"
        renderValue={renderValue}
      >
        {this.props.menu.map((item: ICallerPhoneNumber) => {
          const { phoneNumber, ...rest } = item;
          return (
            <JuiMenuItem
              key={phoneNumber}
              value={phoneNumber}
              style={style}
              {...rest}
            >
              <CallerIdItem {...item} key={phoneNumber} />
            </JuiMenuItem>
          );
        })}
      </JuiVirtualizedBoxSelect>
    );
  }
}

const CallerIdSelectorWithLazyFormat = CallerIdContainer(
  React.forwardRef((props: CallerIdSelectorProps, ref) => (
    <RawCallerIdSelector
      {...props}
      ref={ref as any}
      renderValue={(i: any) => <LazyFormatPhone value={i} />}
    />
  )),
);

const CallerIdSelector = withTranslation('translations')(
  ({ tooltipProps, callerIdProps, t }: CallerIdViewProps & WithTranslation) => {
    return (
      <RuiTooltip
        placement="bottom"
        {...tooltipProps}
        title={t('telephony.callerIdSelector.tooltip')}
      >
        <CallerIdSelectorWithLazyFormat
          {...callerIdProps}
          heightSize="default"
          label={t('telephony.callFrom')}
        />
      </RuiTooltip>
    );
  },
);

export {
  CallerIdSelector,
  CallerIdSelectorProps,
  RawCallerIdSelector,
  CallerIdSelectorWithLazyFormat,
};
