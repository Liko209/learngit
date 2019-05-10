import React from 'react';
import omit from 'lodash/omit';
import RuiIconButton, { RuiIconButtonProps } from './IconButton';
import { Omit } from '../../../foundation/utils/typeHelper';
import togglePairs from './utils/togglePairs';

type ToggleIconButtonProps = Omit<RuiIconButtonProps, 'variant'> & {
  active: boolean;
};

const ToggleIconButton = (props: ToggleIconButtonProps) => {
  const color: string = 'grey.500';
  const { active } = props;
  let iconBtnProps: RuiIconButtonProps;
  if (!active) {
    iconBtnProps = {
      ...omit(props, ['active', 'color']),
      color,
      variant: 'toggle',
      icon: togglePairs[props.icon],
    };
    return (
      <RuiIconButton {...iconBtnProps}>
        {props.children}
      </RuiIconButton>
    );
  }
  iconBtnProps = {
    ...omit(props, 'active'),
    variant: 'toggle',
  };
  return (
    <RuiIconButton {...iconBtnProps}>
      {props.children}
    </RuiIconButton>
  );
};

export { ToggleIconButtonProps };
export default ToggleIconButton;
