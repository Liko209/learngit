import React from 'react';
import { JuiIconography } from 'jui/foundation/Iconography';
import { t } from 'i18next';
import { JuiProfileDialogContentSummaryButton } from 'jui/pattern/Profile/Dialog';
import { TypeDictionary } from 'sdk/utils';
import { ProfileDialogGroupContentViewProps } from '../types';

const getAriaLabelKey = ([ariaTeam, ariaGroup]: string[], typeId: number) => {
  const mapping = {
    [TypeDictionary.TYPE_ID_TEAM]: ariaTeam,
    [TypeDictionary.TYPE_ID_GROUP]: ariaGroup,
  };
  return mapping[typeId];
};

const renderButton = (
  iconName: string,
  buttonMessage: string,
  ariaLabelKey: string[],
  props: ProfileDialogGroupContentViewProps,
  handleClick: (e: React.MouseEvent<HTMLElement>) => any,
) => {
  const { typeId, group } = props;
  return (
    <JuiProfileDialogContentSummaryButton
      aria-label={t(getAriaLabelKey(ariaLabelKey, typeId), {
        name: group.displayName,
      })}
      tabIndex={0}
      onClick={handleClick}
    >
      <JuiIconography fontSize="small" color="primary.main">
        {iconName}
      </JuiIconography>
      {t(buttonMessage)}
    </JuiProfileDialogContentSummaryButton>
  );
};

export { renderButton };
