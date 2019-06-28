import { ComponentType } from 'react';
import { ENTITY_TYPE } from '../constants';

enum BUTTON_TYPE {
  ICON,
  MENU_ITEM,
}

type ActionsProps = {
  id: number | string;
  entity: ENTITY_TYPE;
  hookAfterClick: () => void;
};

type ActionsViewProps = {
  actions: ComponentType<any>[];
};

export { BUTTON_TYPE, ActionsProps, ActionsViewProps, ENTITY_TYPE };
