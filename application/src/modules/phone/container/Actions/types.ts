import { Caller } from 'sdk/module/RCItems/types';
import { ENTITY_TYPE } from '../constants';

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

export { ActionsProps, ActionsViewProps, ENTITY_TYPE };
