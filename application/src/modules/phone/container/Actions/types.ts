import { Caller } from 'sdk/module/RCItems/types';
import PersonModel from '@/store/models/Person';
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
  person: PersonModel | null;
};

export { ActionsProps, ActionsViewProps, ENTITY_TYPE };
