/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-08 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState, useCallback } from 'react';
import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';
import { JuiLineSelect } from '../../Selects/LineSelect';
import { JuiMenuItem } from '../../Menus';
import { JuiListItemText } from '../../Lists';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import styled from '../../../foundation/styled-components';

type JuiRegionSelectProps = {
  initialRegionValue: string;
  label: string;
  selectStyle?: React.CSSProperties;
  regionList: RegionType[];
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  automationId?: string;
};

type RegionType = {
  id: string | number;
  label: string;
  value: string | number;
  regionIcon: JuiIconographyProps['symbol'];
  regionCode?: string;
  desc?: string;
};

const StyledRegionSelectWrap = styled('div')`
  && {
    display: flex;
    align-items: center;
  }
`;

const JuiRegionSelect = React.memo((props: JuiRegionSelectProps) => {
  const [value, setValue] = useState(props.initialRegionValue);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      props.onChange && props.onChange(event);
      setValue(value);
    },
    [],
  );

  const { label, selectStyle, regionList = [], automationId } = props;

  const renderValue = useCallback(
    (value: string) => {
      const selectedItem = regionList.find(
        regionItem => regionItem.value === value,
      );
      const selectRegion: RegionType = selectedItem || {
        id: 0,
        label: '',
        value: '',
        regionIcon: {
          id: '',
          url: '',
          viewBox: '',
        },
        regionCode: '',
      };
      let renderLabel = selectRegion.label;
      if (selectRegion.regionCode !== '') {
        renderLabel += ` (+${selectRegion.regionCode})`;
      }
      return (
        <StyledRegionSelectWrap>
          <MuiListItemIcon>
            <JuiIconography
              iconSize="large"
              symbol={selectRegion.regionIcon}
              desc={selectRegion.desc}
            />
          </MuiListItemIcon>
          <JuiListItemText>{renderLabel}</JuiListItemText>
        </StyledRegionSelectWrap>
      );
    },
    [regionList],
  );

  return (
    <JuiLineSelect
      onChange={handleChange}
      value={value}
      label={label}
      style={selectStyle}
      renderValue={renderValue}
      automationId={automationId}
    >
      {regionList.map((item: RegionType) => {
        const regionIcon = (
          <JuiIconography
            iconSize="large"
            symbol={item.regionIcon}
            desc={item.desc}
          />
        );
        return (
          <JuiMenuItem
            value={item.value}
            key={item.id}
            icon={regionIcon}
            automationId={`${automationId}Item`}
          >
            <JuiListItemText
              primary={item.label}
              secondary={`(+${item.regionCode})`}
            />
          </JuiMenuItem>
        );
      })}
    </JuiLineSelect>
  );
});

export { JuiRegionSelect, JuiRegionSelectProps };
