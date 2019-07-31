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

import { E911ViewProps, Country, State, FieldItem } from './types';

type Props = E911ViewProps & WithTranslation;

type Field = {
  fieldItem: FieldItem;
  automationId: string;
  value: string;
  type: string;
  maxLength?: number;
};

@observer
class E911ViewComponent extends Component<Props> {
  static contextType = dialogContext;

  isOptional(optional?: boolean) {
    return optional ? '' : ' *';
  }

  createField(config: Field) {
    const { handleFieldChange, t } = this.props;
    const { fieldItem, automationId, maxLength = 100, value, type } = config;

    const { label, ghostText, optional } = fieldItem;
    const optionText = this.isOptional(optional);
    const i18n = t(`telephony.e911.fields.${label}`);
    const placeholder = ghostText ? `${t('common.eg')}${ghostText}` : '';

    return (
      <JuiTextField
        id={`${i18n}${optionText}`}
        label={`${i18n}${optionText}`}
        placeholder={placeholder}
        fullWidth
        inputProps={{
          maxLength,
          'data-test-automation-id': automationId,
        }}
        value={value}
        onChange={handleFieldChange(type)}
      />
    );
  }

  get renderState() {
    const {
      stateList,
      stateOnChange,
      t,
      value,
      shouldShowSelectState,
    } = this.props;
    const { stateName } = value;

    return shouldShowSelectState ? (
      <JuiLineSelect
        // menuProps={this.lineSelectProps}
        onChange={stateOnChange}
        label={`${t(`telephony.e911.fields.State/Province`)} *`}
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
      this.renderTextState
    );
  }

  get renderTextState() {
    const { value, fields } = this.props;
    const { state } = value;
    const fieldItem = fields.state;
    if (!fieldItem) {
      return null;
    }

    return this.createField({
      fieldItem,
      automationId: 'e911-stateProvince',
      value: state,
      type: 'state',
    });
  }

  get renderAddress() {
    const { value, fields } = this.props;
    const { street } = value;
    const fieldItem = fields.street;
    if (!fieldItem) {
      return null;
    }

    return this.createField({
      fieldItem,
      automationId: 'e911-streetAddress',
      value: street,
      type: 'street',
    });
  }

  get renderAdditionalAddress() {
    const { value, fields } = this.props;
    const { street2 } = value;
    const fieldItem = fields.additionalAddress;
    if (!fieldItem) {
      return null;
    }

    return this.createField({
      fieldItem,
      automationId: 'e911-additionalAddress',
      value: street2,
      type: 'street2',
    });
  }

  get renderCity() {
    const { value, fields } = this.props;
    const { city } = value;
    const fieldItem = fields.city;
    if (!fieldItem) {
      return null;
    }

    return this.createField({
      fieldItem,
      automationId: 'e911-city',
      value: city,
      type: 'city',
    });
  }

  get renderZipCode() {
    const { value, fields } = this.props;
    const { zip } = value;
    const fieldItem = fields.zipCode;
    if (!fieldItem) {
      return null;
    }

    return this.createField({
      fieldItem,
      automationId: 'e911-zipCode',
      value: zip,
      type: 'zip',
    });
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
      fields,
    } = this.props;

    const { countryName, customerName } = value;

    return (
      <>
        <JuiDialogTitle data-test-automation-id={'DialogTitle'}>
          {t('telephony.e911.title')}
        </JuiDialogTitle>
        <JuiDialogContent>
          <E911Description>
            {t('telephony.e911.dialogDescription')}
          </E911Description>
          <JuiTextField
            id={`${t('telephony.e911.customerName')} *`}
            label={`${t('telephony.e911.customerName')} *`}
            placeholder={`${t('common.eg')}${fields.customerName}`}
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
          {this.renderAddress}
          {this.renderAdditionalAddress}
          {this.renderCity}
          {this.renderState}
          {this.renderZipCode}
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
