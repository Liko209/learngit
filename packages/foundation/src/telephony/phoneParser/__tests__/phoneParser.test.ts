/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-27 15:13:07
 * Copyright © RingCentral. All rights reserved.
 */

import fs from 'fs';
import path from 'path';
import Module from '../phoneParser';
import { ModuleParams, ModuleClass, ModuleType } from '../types';

describe('PhoneParser', () => {
  it('should create phoneParser', async () => {
    const defaultPhoneData = fs
      .readFileSync(path.resolve(__dirname, '../phoneData.xml'))
      .toString();

    const initParams: ModuleParams = {
      onRuntimeInitialized: () => {},
    };
    const PhoneParserModule: ModuleClass = Module;
    const phoneParserModule: ModuleType = new PhoneParserModule(initParams);

    const waiter = new Promise<void>((resolve: () => void) => {
      setTimeout(() => {
        // do real test here

        expect(
          phoneParserModule.ReadRootNodeByString(defaultPhoneData, ''),
        ).toEqual(true);
        expect(phoneParserModule.GetPhoneDataFileVersion()).toEqual('8.2');

        const settingsKey = phoneParserModule.NewSettingsKey('1650', 1210);
        const pp = phoneParserModule.NewPhoneParser(
          '16504724092+103@ringcentral.com',
          settingsKey,
        );
        expect(pp.GetCountryCode()).toEqual('1');
        expect(pp.GetAreaCode()).toEqual('650');
        expect(pp.GetNumber()).toEqual('4724092');
        expect(pp.GetDialable(false)).toEqual('6504724092');
        expect(
          phoneParserModule.EnPDServiceCodeType.enPDSFTCallback.value,
        ).toEqual(2);

        resolve();
      },         4000);
    }).catch(err => console.error(err));

    await waiter;
  });
});
