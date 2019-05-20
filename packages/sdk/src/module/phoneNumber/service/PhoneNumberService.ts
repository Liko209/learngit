/*
 * @Author: Lewi.Li
 * @Date: 2019-05-07 14:15:43
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { PhoneNumber } from '../entity';
import { PhoneNumberController } from '../controller/PhoneNumberController';
class PhoneNumberService extends EntityBaseService<PhoneNumber, string> {
  private _phoneNumberController: PhoneNumberController;
  async getById(id: string): Promise<PhoneNumber | null> {
    const phoneNumber: PhoneNumber = { id };
    return phoneNumber;
  }

  getSynchronously(id: string): PhoneNumber | null {
    const phoneNumber: PhoneNumber = { id };
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

  async generateMatchedPhoneNumberList(phoneNumber: string) {
    return this.getPhoneNumberController().generateMatchedPhoneNumberList(
      phoneNumber,
    );
  }

  isValidNumber(toNumber: string) {
    return this.getPhoneNumberController().isValidNumber(toNumber);
  }
}

export { PhoneNumberService };
