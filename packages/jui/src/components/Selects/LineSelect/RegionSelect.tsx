/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-08 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState, useCallback } from 'react';
import { JuiIconography } from '../../../foundation/Iconography';
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
};

type RegionType = {
  id: string | number;
  value: string;
  regionIcon: any;
  regionCode?: string | number;
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
      setValue(value);
    },
    [],
  );

  const { label, selectStyle, regionList } = props;

  const renderValue = (value: string) => {
    const selectRegion = regionList.filter(
      regionItem => regionItem.value === value,
    )[0];
    return (
      <StyledRegionSelectWrap>
        <MuiListItemIcon>
          <JuiIconography
            iconSize="large"
            symbol={selectRegion.regionIcon}
            desc={selectRegion.desc}
          />
        </MuiListItemIcon>
        <JuiListItemText>{value}</JuiListItemText>
      </StyledRegionSelectWrap>
    );
  };
  return (
    <JuiLineSelect
      onChange={handleChange}
      value={value}
      label={label}
      style={selectStyle}
      renderValue={renderValue}
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
          <JuiMenuItem value={item.value} key={item.id} icon={regionIcon}>
            <JuiListItemText primary={item.value} secondary={item.regionCode} />
          </JuiMenuItem>
        );
      })}
    </JuiLineSelect>
  );
});

export { JuiRegionSelect, JuiRegionSelectProps };
