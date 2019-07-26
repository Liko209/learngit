/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-28 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import { debounce } from 'lodash';
import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { RuiSlider } from 'rcui/components/Forms/Slider';
import { SliderSettingItemViewProps, SliderSettingItemProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { catchError } from '@/common/catchError';
import { Grid } from '@material-ui/core';

type Props = SliderSettingItemViewProps &
  SliderSettingItemProps &
  WithTranslation;

@observer
class SliderSettingItemViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  private _handleChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>, value: number) => {
      await this.props.saveSetting(value);
    },
    10,
    { maxWait: 1000 / 60 }, // Ensure 60FPS
  );
  private _renderSlider() {
    const { disabled, settingItem, settingItemEntity } = this.props;

    const { value = 0 } = settingItemEntity;
    const { min, max, step, valueLabelFormat, Left, Right } = settingItem;

    return (
      <Grid container spacing={4} alignItems="center">
        <Grid item>{Left}</Grid>
        <Grid item xs>
          <RuiSlider
            onChange={this._handleChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            valueLabelFormat={valueLabelFormat}
            value={value}
            data-test-automation-id={`settingItemSlider-${
              settingItem.automationId
            }`}
            data-test-automation-value={value}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>{Right}</Grid>
      </Grid>
    );
  }
  render() {
    const { t, id, disabled, settingItem } = this.props;
    return (
      <JuiSettingSectionItem
        id={id}
        automationId={settingItem.automationId}
        disabled={disabled}
        label={t(settingItem.title || '')}
        description={t(settingItem.description || '')}
      >
        {this._renderSlider()}
      </JuiSettingSectionItem>
    );
  }
}

const SliderSettingItemView = withTranslation('translations')(
  SliderSettingItemViewComponent,
);
export { SliderSettingItemView };
