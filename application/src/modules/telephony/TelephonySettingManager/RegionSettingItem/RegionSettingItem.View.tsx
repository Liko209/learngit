/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiButton } from 'jui/components/Buttons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RegionSettingItemViewProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { JuiDialogTitle, JuiModal } from 'jui/components/Dialog';
import { withEscTracking } from '@/containers/Dialog';
import { JuiRegionSelect } from 'jui/components/Selects';
import { JuiTextField } from 'jui/components/Forms';
import { JuiTypography } from 'jui/foundation/Typography';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { dataTrackingForSetting } from '@/modules/setting/container/SettingItem/utils/dataTrackingForSetting';

const Modal = withEscTracking(JuiModal);
const DATA_REACTING_CONFIG = {
  name: 'regionSettings',
  type: 'phoneGeneral',
};

type Props = WithTranslation & RegionSettingItemViewProps;
type State = {
  dialogOpen: boolean;
};
@observer
class RegionSettingItemViewComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dialogOpen: false,
    };
  }

  handleClicked = async () => {
    await this.props.loadRegionSetting();
    this.setState({
      dialogOpen: true,
    });
    dataTrackingForSetting(DATA_REACTING_CONFIG);
  };

  render() {
    const { t, settingItemEntity } = this.props;
    const { value, state } = settingItemEntity;

    const regionText = t('setting.phone.general.regionSetting.region');

    let descriptionText = '';
    if (value) {
      const { areaCode, countryInfo } = value;
      const { name, callingCode } = countryInfo;
      const countryDesc = `${name} (+${callingCode})`;
      descriptionText = t(
        'setting.phone.general.regionSetting.descriptionWithoutAreaCode',
        {
          country: countryDesc,
        },
      );

      if (areaCode) {
        const areaCodeDesc = areaCode ? `${areaCode}` : '';
        descriptionText = t('setting.phone.general.regionSetting.description', {
          country: countryDesc,
          areaCode: areaCodeDesc,
        });
      }
    }

    const disabled = state === ESettingItemState.DISABLE;
    return (
      <JuiSettingSectionItem
        id="regionSetting"
        label={regionText}
        description={descriptionText}
        disabled={disabled}
      >
        <JuiButton
          color="primary"
          onClick={this.handleClicked}
          disabled={disabled}
          data-test-automation-id="settingItemButton-regionSetting"
        >
          {t('setting.edit')}
        </JuiButton>
        {this._renderDialog()}
      </JuiSettingSectionItem>
    );
  }

  private _saveRegion = async () => {
    const { saveRegion, dialPlanISOCode, areaCode } = this.props;
    const save = await saveRegion(dialPlanISOCode, areaCode);
    save && this.setState({ dialogOpen: false });
  };

  private _onCancel = () => {
    this.setState({
      dialogOpen: false,
    });
  };

  private _renderDialog() {
    const {
      t,
      currentCountryInfo,
      countriesList,
      handleDialPlanChange,
      renderAreaCode,
      areaCode,
      areaCodeError,
      errorMsg,
      handleAreaCodeChange,
      disabledOkBtn,
    } = this.props;

    const { isoCode } = currentCountryInfo;
    const regionText = t('setting.phone.general.regionSetting.region');
    const countryText = t('setting.phone.general.regionSetting.country');
    const areaCodeText = t('setting.phone.general.regionSetting.areaCode');
    const saveText = t('common.dialog.save');
    const cancelText = t('common.dialog.cancel');

    const regionChangeDesc = t(
      'setting.phone.general.regionSetting.regionChangeDesc',
    );
    return (
      this.state.dialogOpen && (
        <Modal
          modalProps={{
            'data-test-automation-id': 'dialog-regionSetting',
          }}
          title={
            <JuiDialogTitle data-test-automation-id="dialog-header-regionSetting">
              {regionText}
            </JuiDialogTitle>
          }
          size="small"
          okText={saveText}
          cancelText={cancelText}
          open={this.state.dialogOpen}
          onOK={this._saveRegion}
          onCancel={this._onCancel}
          okBtnProps={{
            disabled: disabledOkBtn,
            'data-test-automation-id': 'dialog-okButton-regionSetting',
          }}
          cancelBtnProps={{
            'data-test-automation-id': 'dialog-cancelButton-regionSetting',
          }}
        >
          <JuiTypography
            variant={'caption'}
            gutterBottom
            data-test-automation-id="dialog-contentDescription-regionSetting"
          >
            {regionChangeDesc}
          </JuiTypography>
          <JuiRegionSelect
            label={countryText}
            initialRegionValue={isoCode}
            regionList={countriesList}
            onChange={handleDialPlanChange}
            automationId={'regionSettingDialPlanSelect'}
          />
          {!!renderAreaCode && (
            <JuiTextField
              id="areaCode"
              label={areaCodeText}
              value={areaCode}
              fullWidth
              error={areaCodeError}
              inputProps={{
                maxLength: 200,
                'data-test-automation-id': 'dialog-regionSetting-areaCodeInput',
              }}
              helperText={areaCodeError && errorMsg}
              onChange={handleAreaCodeChange}
              data-test-automation-id="dialog-regionSetting-areaCodeTextField"
            />
          )}
        </Modal>
      )
    );
  }
}

const RegionSettingItemView = withTranslation('translations')(
  RegionSettingItemViewComponent,
);

export { RegionSettingItemView };
