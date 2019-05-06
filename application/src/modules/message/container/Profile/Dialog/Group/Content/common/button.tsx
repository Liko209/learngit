import React from 'react';
import { JuiIconography } from 'jui/foundation/Iconography';
import { JuiProfileDialogContentSummaryButton } from 'jui/pattern/Profile/Dialog';
import { WithTranslation } from 'react-i18next';
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
  props: ProfileDialogGroupContentViewProps & WithTranslation,
  handleClick: (e: React.MouseEvent<HTMLElement>) => any,
) => {
  const { typeId, group, t } = props;
  return (
    <JuiProfileDialogContentSummaryButton
      aria-label={t(getAriaLabelKey(ariaLabelKey, typeId), {
        name: group.displayName,
      })}
      tabIndex={0}
      onClick={handleClick}
    >
      <JuiIconography iconSize="medium">{iconName}</JuiIconography>
      {t(buttonMessage)}
    </JuiProfileDialogContentSummaryButton>
  );
};

export { renderButton };
