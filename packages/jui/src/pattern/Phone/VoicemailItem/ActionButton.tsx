import React from 'react';
import { JuiIconButton } from '../../../components/Buttons';
import { JuiMenuItem } from '../../../components/Menus';
import { JuiActionIconWrapper } from './Actions';

enum BUTTON_TYPE {
  ICON,
  MENU_ITEM,
}

type ActionButtonProps = {
  icon: string;
  tooltip: string;
  type: BUTTON_TYPE;
  automationId: string;
  screenReader: string;
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

const ActionButton = function({
  icon,
  type,
  tooltip,
  onClick,
  screenReader,
  automationId,
}: ActionButtonProps) {
  if (type === BUTTON_TYPE.ICON) {
    return (
      <JuiActionIconWrapper>
        <JuiIconButton
          color="common.white"
          variant="round"
          autoFocus={false}
          size="small"
          data-test-automation-id={automationId}
          ariaLabel={screenReader}
          tooltipTitle={tooltip}
          onClick={onClick}
        >
          {icon}
        </JuiIconButton>
      </JuiActionIconWrapper>
    );
  }
  return (
    <JuiMenuItem
      icon={icon}
      onClick={onClick}
      aria-label={screenReader}
      data-test-automation-id={automationId}
    >
      {tooltip}
    </JuiMenuItem>
  );
};

export { ActionButton, BUTTON_TYPE };
