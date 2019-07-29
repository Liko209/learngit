/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-29 11:22:13
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { RCInfoService } from 'sdk/module/rcInfo';

import { E911ViewModel } from '../E911.ViewModel';

jest.mock('@/containers/Notification');

describe('E911ViewModel', () => {
  function createUserInfo(value: any = {}) {
    return {
      value,
    };
  }

  @testable
  class disabled {
    @test('should be false if some need check field is undefined')
    @mockEntity(
      createUserInfo({
        street: 'street',
      }),
    )
    t1() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeTruthy();
    }

    @test('should be true and check state if state list > 0')
    @mockEntity(
      createUserInfo({
        country: 'country',
        customerName: 'customerName',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, 'getStateList', [1])
    async t2() {
      const vm = new E911ViewModel({});
      await vm.getState('1');
      expect(vm.disabled).toBeTruthy();
    }

    @test('should be true if has all check field')
    @mockEntity(
      createUserInfo({
        country: 'country',
        customerName: 'customerName',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    t3() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeTruthy();
    }
  }

  @testable
  class getState {
    @test('should be call saveStateOrCountry if getState')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, 'getStateList', [1])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry');
      await vm.getState('1');
      expect(vm.stateList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', 1);
    }
  }

  @testable
  class getCountryInfo {
    @test('should be call saveStateOrCountry if getState')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, [
      {
        method: 'getCountryList',
        data: [1],
      },
      {
        method: 'getCurrentCountry',
        data: {
          id: 2,
          name: 'current',
        },
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      expect(vm.countryList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', {
        id: 2,
        name: 'current',
      });
      expect(vm.getState).toHaveBeenCalledWith(2);
    }

    @test('should be use countryList first if not current country')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, [
      {
        method: 'getCountryList',
        data: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
      },
      {
        method: 'getCurrentCountry',
        data: {},
      },
    ])
    async t2() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      expect(vm.countryList).toEqual([
        {
          id: 1,
          name: 'countryList',
        },
      ]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', {
        id: 1,
        name: 'countryList',
      });
      expect(vm.getState).toHaveBeenCalledWith(1);
    }
  }

  @testable
  class countryOnChange {
    @test('should be get state if country change')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, [
      {
        method: 'getCountryList',
        data: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
      },
      {
        method: 'getCurrentCountry',
        data: {},
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      await vm.countryOnChange({ target: { value: 'countryList' } } as any);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', {
        id: 1,
        name: 'countryList',
      });
      expect(vm.getState).toHaveBeenCalledWith(1);
    }
  }

  @testable
  class stateOnChange {
    @test('should be save state if state change')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, 'getStateList', [
      {
        name: 'state',
      },
    ])
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry');
      await vm.getState('1');
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', {
        name: 'state',
      });
    }
  }

  @testable
  class saveStateOrCountry {
    @test('should be save state if state change')
    @mockEntity(createUserInfo())
    t1() {
      const vm = new E911ViewModel({});
      vm.saveStateOrCountry('state', {
        id: 'id',
        name: 'name',
        isoCode: 'isoCode',
      });
      expect(vm.value).toMatchObject({
        state: 'isoCode',
        stateName: 'name',
        stateId: 'id',
        stateIsoCode: 'isoCode',
      });
    }
  }

  @testable
  class handleFieldChange {
    @test('should be save value if field change')
    @mockEntity(createUserInfo())
    t1() {
      const vm = new E911ViewModel({});
      vm.handleFieldChange('customerName')({
        target: { value: 'customerName' },
      } as any);
      expect(vm.value.customerName).toBe('customerName');
    }
  }

  const valueSetter = jest.fn();

  @testable
  class onSubmit {
    @test('should be save value if field change')
    @mockEntity({
      valueSetter,
    })
    t1() {
      const vm = new E911ViewModel({});
      vm.onSubmit();
      expect(valueSetter).toHaveBeenCalledWith(vm.value);
    }
  }
});
