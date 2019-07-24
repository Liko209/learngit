/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
// import { JuiDialogContent } from 'jui/components/Dialog';
import { Wrapper } from 'jui/pattern/E911';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiLineSelect } from 'jui/components/Selects/LineSelect';
import { JuiMenuItem } from 'jui/components';

import { E911ViewProps } from './types';

type Props = E911ViewProps & WithTranslation;

@observer
class E911ViewComponent extends Component<Props> {
  render() {
    const { t, handleNameChange } = this.props;
    return (
      <Wrapper>
        Emergency Service dispatchers will send emergency first responders to
        this exact location. Where will you be using this phone?
        <JuiTextField
          id={`${t('telephony.e911.customerName')} *`}
          label={`${t('telephony.e911.customerName')} *`}
          placeholder={t('telephony.e911.customerNamePlaceholder')}
          fullWidth
          inputProps={{
            maxLength: 100,
            'data-test-automation-id': 'e911-customerName',
          }}
          // inputRef={this.teamNameRef}
          onChange={handleNameChange}
        />
        <JuiLineSelect
          // menuProps={this.lineSelectProps}
          // onChange={handleSearchPostDateChange}
          label={t('common.country')}
          automationId="e911-country-select"
          // value={this.props.timeType}
        >
          {[1, 2, 3].map((number: number) => (
            <JuiMenuItem
              automationId={`timePost-${number}`}
              value={number}
              key={number}
            >
              {number}
            </JuiMenuItem>
          ))}
        </JuiLineSelect>
        <JuiTextField
          id={`${t('telephony.e911.streetAddress')} *`}
          label={`${t('telephony.e911.streetAddress')} *`}
          placeholder={t('telephony.e911.streetAddressPlaceholder')}
          fullWidth
          inputProps={{
            maxLength: 100,
            'data-test-automation-id': 'e911-streetAddress',
          }}
          // onChange={handleNameChange}
        />
        <JuiTextField
          id={t('telephony.e911.additionalAddress')}
          label={t('telephony.e911.additionalAddress')}
          placeholder={t('telephony.e911.additionalAddressPlaceholder')}
          fullWidth
          inputProps={{
            maxLength: 100,
            'data-test-automation-id': 'e911-additionalAddress',
          }}
          // onChange={handleNameChange}
        />
        <JuiTextField
          id={`${t('common.city')} *`}
          label={`${t('common.city')} *`}
          placeholder={t('common.cityPlaceholder')}
          fullWidth
          inputProps={{
            maxLength: 100,
            'data-test-automation-id': 'e911-city',
          }}
          // onChange={handleNameChange}
        />
        <JuiTextField
          id={`${t('common.zipCode')} *`}
          label={`${t('common.zipCode')} *`}
          placeholder={t('common.zipCodePlaceholder')}
          fullWidth
          inputProps={{
            maxLength: 100,
            'data-test-automation-id': 'e911-zipCode',
          }}
          // onChange={handleNameChange}
        />
      </Wrapper>
    );
  }
}

const E911View = withTranslation('translations')(E911ViewComponent);

export { E911View };
