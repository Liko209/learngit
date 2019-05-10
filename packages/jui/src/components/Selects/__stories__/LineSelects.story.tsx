import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../foundation/utils/decorators';
import { JuiLineSelect } from '../LineSelect';
import { JuiMenuItem } from '../../Menus';
import { JuiRegionSelect } from '../LineSelect/RegionSelect';
import cn from '../../../assets/country-svg/cn.svg';
import ca from '../../../assets/country-svg/ca.svg';
import eg from '../../../assets/country-svg/eg.svg';

type Menu = {
  id: number | string;
  value: string;
  regionIcon?: any;
  regionNum?: string;
};

const menu = [
  { id: 1, value: 'One' },
  { id: 2, value: 'Two' },
  { id: 3, value: 'Three' },
];

const MenuProps: any = {
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  getContentAnchorEl: null,
};

const LineSelect = () => {
  const [value, setValue] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setValue(value);
  };
  return (
    <JuiLineSelect
      onChange={handleChange}
      value={value}
      label="select"
      menuProps={MenuProps}
      style={{ width: '200px', textAlign: 'left' }}
    >
      {menu.map((item: Menu) => (
        <JuiMenuItem value={item.id} key={item.id}>
          {item.value}
        </JuiMenuItem>
      ))}
    </JuiLineSelect>
  );
};

const regionList = [
  { id: 1, value: 'China', regionIcon: cn, regionCode: '+86' },
  { id: 2, value: 'England', regionIcon: eg },
  { id: 3, value: 'Canada', regionIcon: ca, regionCode: '+xxx' },
];

const RegionLineSelect = () => {
  const initialRegionValue = regionList[0].value;

  return (
    <JuiRegionSelect
      initialRegionValue={initialRegionValue}
      label="RegionLabel"
      regionList={regionList}
      selectStyle={{ width: '200px', textAlign: 'left' }}
    />
  );
};

storiesOf('Components/Selects', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiLineSelect, { inline: true }))
  .add('LineSelect', () => {
    return (
      <div>
        <div style={{ padding: '0 30%' }}>
          <LineSelect />
        </div>
        <div style={{ padding: '0 30%' }}>
          <RegionLineSelect />
        </div>
      </div>
    );
  });
