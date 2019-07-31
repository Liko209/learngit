/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiDialogContent,
  JuiDialogTitle,
  JuiDialogActions,
} from 'jui/components/Dialog';
import { JuiButton } from 'jui/components/Buttons/Button';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiLineSelect } from 'jui/components/Selects/LineSelect';
import { JuiMenuItem } from 'jui/components';
import dialogContext from '@/containers/Dialog/DialogContext';
import { StyledTip, E911Description } from 'jui/pattern/E911';

import { E911ViewProps, Country, State } from './types';

type Props = E911ViewProps & WithTranslation;

@observer
class E911ViewComponent extends Component<Props> {
  static contextType = dialogContext;

  get renderState() {
    const {
      stateList,
      stateOnChange,
      t,
      value,
      handleFieldChange,
    } = this.props;
    const { stateName, state } = value;
    return stateList.length > 0 ? (
      <JuiLineSelect
        // menuProps={this.lineSelectProps}
        onChange={stateOnChange}
        label={`${t('telephony.e911.stateProvince')} *`}
        automationId="e911-state-select"
        value={stateName}
      >
        {stateList.map((item: State) => (
          <JuiMenuItem
            automationId={`state-${item.name}`}
            value={item.name}
            key={item.id}
          >
            {item.name}
          </JuiMenuItem>
        ))}
      </JuiLineSelect>
    ) : (
      <JuiTextField
        id={`${t('telephony.e911.stateProvince')}`}
        label={`${t('telephony.e911.stateProvince')}`}
        fullWidth
        inputProps={{
          maxLength: 100,
          'data-test-automation-id': 'e911-stateProvince',
        }}
        value={state}
        onChange={handleFieldChange('state')}
      />
    );
  }

  onSubmit = async () => {
    const { onSubmit } = this.props;
    await onSubmit();
    this.context();
  };

  render() {
    const {
      t,
      handleFieldChange,
      countryList,
      countryOnChange,
      value,
      disabled,
    } = this.props;

    const { countryName, customerName, city, zip, street, street2 } = value;
    return (
      <>
        <JuiDialogTitle data-test-automation-id={'DialogTitle'}>
          Confirm address for emergency calls
        </JuiDialogTitle>
        <JuiDialogContent>
          <E911Description>
            {t('telephony.e911.dialogDescription')}
          </E911Description>
          <JuiTextField
            id={`${t('telephony.e911.customerName')} *`}
            label={`${t('telephony.e911.customerName')} *`}
            placeholder={t('telephony.e911.customerNamePlaceholder')}
            fullWidth
            inputProps={{
              maxLength: 100,
              'data-test-automation-id': 'e911-customerName',
            }}
            value={customerName}
            // inputRef={this.teamNameRef}
            onChange={handleFieldChange('customerName')}
          />
          <JuiLineSelect
            // menuProps={this.lineSelectProps}
            onChange={countryOnChange}
            label={`${t('common.country')} *`}
            automationId="e911-country-select"
            value={countryName}
          >
            {countryList.map((item: Country) => (
              <JuiMenuItem
                automationId={`country-${item.name}`}
                value={item.name}
                key={item.id}
              >
                {item.name}
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
            value={street}
            onChange={handleFieldChange('street')}
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
            value={street2}
            onChange={handleFieldChange('street2')}
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
            value={city}
            onChange={handleFieldChange('city')}
          />
          {this.renderState}
          <JuiTextField
            id={`${t('common.zipCode')} *`}
            label={`${t('common.zipCode')} *`}
            placeholder={t('common.zipCodePlaceholder')}
            fullWidth
            inputProps={{
              maxLength: 100,
              'data-test-automation-id': 'e911-zipCode',
            }}
            value={zip}
            onChange={handleFieldChange('zip')}
          />
          <StyledTip>{t('telephony.e911.outOfCountryDisclaimers')}</StyledTip>
        </JuiDialogContent>
        <JuiDialogActions data-test-automation-id="DialogActions">
          <JuiButton
            color="primary"
            variant="text"
            data-test-automation-id="DialogCancelButton"
            autoFocus={false}
            onClick={this.context}
            // disabled={loading}
          >
            {t('common.dialog.cancel')}
          </JuiButton>
          <JuiButton
            onClick={this.onSubmit}
            color="primary"
            variant="contained"
            autoFocus={false}
            data-test-automation-id="DialogOKButton"
            disabled={disabled}
          >
            {t('common.dialog.confirm')}
          </JuiButton>
        </JuiDialogActions>
      </>
    );
  }
}

const E911View = withTranslation('translations')(E911ViewComponent);

export { E911View };
