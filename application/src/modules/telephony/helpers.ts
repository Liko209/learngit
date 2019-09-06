import { isFunction } from 'lodash';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import history from '@/history';
import { i18nP } from '@/utils/i18nT';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { getEntity } from '@/store/utils';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ENTITY_NAME } from '@/store';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import CallModel from '@/store/models/Call';
import { VOICEMAILS_ROOT_PATH, CALL_LOG_ROOT_PATH } from './interface/constant';
import { MESSAGE_AVAILABILITY } from 'sdk/module/RCItems/constants';

/**
 * Moves the caret (cursor) position to the end of the specified text field.
 * HACK: `HTMLInputElement | any` to fix `createTextRange` missing in standard HTML spec
 */
export const focusCampo = (inputField: HTMLInputElement | any) => {
  if (!inputField) {
    return;
  }
  inputField.blur();

  if (isFunction(inputField.createTextRange as any)) {
    const FieldRange = (inputField.createTextRange as Function)();
    FieldRange.moveStart('character', inputField.value.length);
    FieldRange.collapse();
    FieldRange.select();
  } else if (inputField.selectionStart || inputField.selectionStart === 0) {
    const elemLen = inputField.value.length;
    inputField.selectionStart = elemLen;
    inputField.selectionEnd = elemLen;
  }
  requestAnimationFrame(() => {
    inputField && inputField.focus();
  });
};

export const getDisplayName = (
  t: Function,
  direction?: CALL_DIRECTION,
  name?: string,
): string =>
  typeof name !== 'string'
    ? ''
    : name.length
    ? name
    : direction === CALL_DIRECTION.INBOUND
    ? t('telephony.unknownCaller')
    : t('telephony.unknownCallee');

export function sleep(timeout: number = 0) {
  let timer: any;
  const promise = new Promise(resolve => {
    timer = setTimeout(resolve, timeout);
  });
  return {
    timer,
    promise,
  };
}

export function toFirstLetterUpperCase(input: string) {
  return `${input[0].toUpperCase()}${input.slice(1, input.length)}`;
}

export async function getDisplayNameByCaller(caller: ActiveCall | CallModel, isCallModel?: boolean) {
  const { fromName, toName, direction } = caller;
  const from = (caller as ActiveCall).from || (caller as CallModel).fromNum;
  const to = (caller as ActiveCall).to || (caller as CallModel).toNum;
  const phoneNumber = direction === CALL_DIRECTION.OUTBOUND ? to : from;
  const callerName = direction === CALL_DIRECTION.OUTBOUND ? toName : fromName;

  if (!phoneNumber || !caller) {
    return isCallModel ? i18nP('phone.unknownCaller') : i18nP('telephony.switchCall.unknownCaller');
  }

  const person = await ServiceLoader.getInstance<PersonService>(
    ServiceConfig.PERSON_SERVICE,
  ).matchContactByPhoneNumber(phoneNumber);
  const personId = person ? person.id : undefined;

  const personEntity = personId
    ? getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, personId)
    : null;

  if (personEntity) {
    return personEntity.userDisplayName;
  }

  if (callerName) {
    return callerName === 'Anonymous'
      ? (isCallModel ? i18nP('phone.unknownCaller') : i18nP('telephony.switchCall.unknownCaller'))
      : callerName;
  }

  return formatPhoneNumber(phoneNumber);
}

const linkWhenRouteInactive = (pathname: string) => {
  const { location, push } = history;

  if (!location.pathname.includes(pathname)) {
    push(pathname);
  }
}

export const onVoicemailNotificationClick = async (id: number) => {
  linkWhenRouteInactive(VOICEMAILS_ROOT_PATH);

  const voicemail = await ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    ).getById(id);

  const isVoicemailExisted = voicemail
    && (voicemail.availability === MESSAGE_AVAILABILITY.ALIVE);

  if (!isVoicemailExisted) {
    Notification.flashToast({
      message: i18nP('telephony.prompt.voicemailDeleted'),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }
};

export const onMissedCallNotificationClick = () => {
  linkWhenRouteInactive(CALL_LOG_ROOT_PATH);
};
