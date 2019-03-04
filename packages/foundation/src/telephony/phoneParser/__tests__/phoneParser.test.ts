/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-27 15:13:07
 * Copyright © RingCentral. All rights reserved.
 */

import fs from 'fs';
import Module from '../phoneParser';
import { ModuleParams, ModuleClass, ModuleType } from '../types';
import { localPhoneDataPath } from '../../';

describe('PhoneParser', () => {
  it('should create phoneParser', async () => {
    const defaultPhoneData = fs.readFileSync(localPhoneDataPath).toString();

    const initParams: ModuleParams = {
      onRuntimeInitialized: () => {},
    };
    const PhoneParserModule: ModuleClass = Module;
    const phoneParserModule: ModuleType = new PhoneParserModule(initParams);

    const waiter = new Promise<void>((resolve: () => void) => {
      setTimeout(() => {
        // do real test here

        phoneParserModule.SetStationLocation(
          '86',
          '0591',
          1210,
          5,
          false,
          '',
          5,
          '',
        );
        expect(phoneParserModule.GetStationCountryCode()).toEqual('86');
        expect(phoneParserModule.GetStationAreaCode()).toEqual('0591');
        expect(phoneParserModule.GetStationSettingsKey()).toEqual({});

        expect(
          phoneParserModule.ReadRootNodeByString(defaultPhoneData),
        ).toEqual(true);
        expect(phoneParserModule.GetPhoneDataFileVersion()).toEqual('8.2');

        const settingsKey = phoneParserModule.NewSettingsKey('1650', 1210);
        const phoneParser = phoneParserModule.NewPhoneParser(
          '16504724092+103@ringcentral.com',
          settingsKey,
        );
        expect(phoneParser.GetE164Extended(true)).toEqual('+16504724092*103');
        expect(phoneParser.GetE164TAS(false)).toEqual('+16504724092');
        expect(phoneParser.GetCanonical(true)).toEqual(
          '+1 (650) 4724092 * 103',
        );
        expect(phoneParser.GetLocalCanonical(true)).toEqual(
          '(650) 472-4092 * 103',
        );
        expect(phoneParser.IsRCExtension()).toEqual(false);
        expect(phoneParser.IsTollFree()).toEqual(false);
        expect(phoneParser.IsSpecialNumber()).toEqual(false);
        expect(phoneParser.GetServiceCodeType().value).toEqual(
          phoneParserModule.EnPDServiceCodeType.enPDSFTUnknown.value,
        );
        expect(phoneParser.CheckValidForCountry(true)).toEqual(true);
        expect(phoneParser.GetSpecialPrefixMask()).toEqual('');
        expect(phoneParser.GetSpecialNumberTemplate()).toEqual('');
        expect(phoneParser.IsEmpty()).toEqual(false);
        expect(phoneParser.GetNumber()).toEqual('4724092');
        expect(phoneParser.GetCountryCode()).toEqual('1');
        expect(phoneParser.GetAreaCode()).toEqual('650');
        expect(phoneParser.GetCountryId()).toEqual(1);
        expect(phoneParser.GetCountryName()).toEqual(
          'United States of America',
        );
        expect(phoneParser.GetDialable(false)).toEqual('6504724092');
        expect(phoneParser.GetDtmfPostfix()).toEqual('');

        expect(
          phoneParserModule.EnPDServiceCodeType.enPDSFTCallback.value,
        ).toEqual(2);

        const regionalInfo = phoneParserModule.GetRegionalInfo(1, '650');
        expect(regionalInfo.areaCode).toEqual('650');
        expect(regionalInfo.HasBan()).toEqual(false);

        resolve();
      },         4000);
    }).catch(err => console.error(err));

    await waiter;
  });
});
