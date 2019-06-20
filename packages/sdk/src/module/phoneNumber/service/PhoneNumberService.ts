/*
 * @Author: Lewi.Li
 * @Date: 2019-05-07 14:15:43
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { PhoneNumber, PhoneNumberType } from '../entity';
import { PhoneNumberController } from '../controller/PhoneNumberController';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { ENTITY } from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { Person } from 'sdk/module/person/entity';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
class PhoneNumberService extends EntityBaseService<PhoneNumber, string> {
  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [ENTITY.PERSON]: this._handlePersonPayload,
      }),
    );
  }

  private _phoneNumberController: PhoneNumberController;
  async getById(id: string): Promise<PhoneNumber | null> {
    const phoneNumber: PhoneNumber = {
      id,
      phoneNumberType: PhoneNumberType.Unknown,
    };
    return phoneNumber;
  }

  getSynchronously(id: string): PhoneNumber | null {
    const phoneNumber: PhoneNumber = {
      id,
      phoneNumberType: PhoneNumberType.Unknown,
    };
    return phoneNumber;
  }

  protected getPhoneNumberController() {
    if (!this._phoneNumberController) {
      this._phoneNumberController = new PhoneNumberController();
    }
    return this._phoneNumberController;
  }

  async getE164PhoneNumber(phoneNumber: string) {
    return this.getPhoneNumberController().getE164PhoneNumber(phoneNumber);
  }

  async getLocalCanonical(phoneNumber: string) {
    return this.getPhoneNumberController().getLocalCanonical(phoneNumber);
  }

  async generateMatchedPhoneNumberList(
    phoneNumber: string,
    phoneParserUtility: PhoneParserUtility,
  ) {
    return this.getPhoneNumberController().generateMatchedPhoneNumberList(
      phoneNumber,
      phoneParserUtility,
    );
  }

  isValidNumber(toNumber: string) {
    return this.getPhoneNumberController().isValidNumber(toNumber);
  }

  private _handlePersonPayload = (
    payload: NotificationEntityPayload<Person>,
  ) => {
    return this.getPhoneNumberController().handlePersonPayload(payload);
  }
}

export { PhoneNumberService };
