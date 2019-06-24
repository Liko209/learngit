import { Caller } from 'sdk/module/RCItems/types';
import { ENTITY_TYPE } from '../constants';

enum BUTTON_TYPE {
  ICON,
  MENU_ITEM,
}

type ActionsProps = {
  id: number | string;
  entity: ENTITY_TYPE;
  caller?: Caller;
  maxButtonCount: number;
  hookAfterClick: () => void;
  canEditBlockNumbers: boolean;
};

type ActionsViewProps = {
  shouldShowBlock: boolean;
};

export { BUTTON_TYPE, ActionsProps, ActionsViewProps, ENTITY_TYPE };
