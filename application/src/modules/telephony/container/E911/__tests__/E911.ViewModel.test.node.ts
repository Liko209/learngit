/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-29 11:22:13
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { networkErrorFunc, serverErrorFunc } from 'shield/utils';
import { RCInfoService } from 'sdk/module/rcInfo';
import { Notification } from '@/containers/Notification';
import { JRCError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

import { E911ViewModel } from '../E911.ViewModel';
import { OutOfCountryDisclaimer } from '../config';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('@/containers/Notification');
const DEFAULT_FIELDS = {
  street: '',
  street2: '',
  city: '',
  state: '',
  stateId: '',
  stateIsoCode: '',
  stateName: '',
  country: '',
  countryId: '',
  countryIsoCode: '',
  countryName: '',
  zip: '',
  customerName: '',
  outOfCountry: false,
};
const checkNotification = (message: string) => ({
  message,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
  autoHideDuration: 3000,
});

const defaultFields = {
  customerName: 'John Doe',
  street: {
    label: 'Street address',
    ghostText: '120 1st St SW',
  },
  street2: {
    label: 'Additional address',
    ghostText: 'Suite 500 or Building A, Floor 3',
    optional: true,
  },
  city: {
    label: 'City',
    ghostText: 'Alabaster',
  },
  state: {
    label: 'State/Province',
    ghostText: '',
    optional: true,
  },
  zip: {
    label: 'Zip code',
    ghostText: '35007',
  },
};

describe('E911ViewModel', () => {
  function createUserInfo(value: any = {}) {
    return {
      value,
    };
  }

  function mockRCInfoServiceMethods(
    {
      stateList = {} as any,
      countryList = [] as any,
      currentCountry = {} as any,
    } = {} as any,
  ) {
    return [
      {
        method: 'getStateList',
        data: stateList,
      },
      {
        method: 'getAllCountryList',
        data: countryList,
      },
      {
        method: 'getCurrentCountry',
        data: currentCountry,
      },
    ];
  }

  @testable
  class disabled {
    @test('should be true if some need check field is undefined')
    @mockEntity(
      createUserInfo({
        street: 'street',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t1() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeTruthy();
    }

    @test('should be false match default config if have all fields')
    @mockEntity(
      createUserInfo({
        customerName: 'customerName',
        country: 'country',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t2() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeFalsy();
    }

    @test('should be false match US if have all fields')
    @mockEntity(
      createUserInfo({
        customerName: 'customerName',
        country: 'US',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t3() {
      const vm = new E911ViewModel({});
      expect(vm.disabled).toBeFalsy();
    }

    @test('should be disabled if not check all checkbox')
    @mockEntity(
      createUserInfo({
        customerName: 'customerName',
        country: 'US',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t4() {
      const vm = new E911ViewModel({});
      vm.checkboxList = [
        {
          checked: false,
        },
      ] as any;
      expect(vm.disabled).toBeTruthy();
    }

    @test('should be not disabled if not check all checkbox')
    @mockEntity(
      createUserInfo({
        customerName: 'customerName',
        country: 'US',
        street: 'street',
        city: 'city',
        zip: 'zip',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t5() {
      const vm = new E911ViewModel({});
      vm.checkboxList = [
        {
          checked: true,
        },
      ] as any;
      expect(vm.disabled).toBeFalsy();
    }
  }

  @testable
  class getState {
    @test('should be get state list if country is US/Canada/Puerto Rico')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, mockRCInfoServiceMethods({ stateList: [1] }))
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      vm.value.country = 'US';
      await vm.getState({
        isoCode: 'US',
      });
      expect(vm.stateList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', 1);

      vm.value.countryName = 'Canada';
      await vm.getState({
        name: 'Canada',
      });
      expect(vm.stateList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', 1);

      vm.value.countryName = 'Puerto Rico';
      await vm.getState({
        name: 'Puerto Rico',
      });
      expect(vm.stateList).toEqual([1]);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', 1);
    }

    @test('should not call saveStateOrCountry if country not in white list')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, mockRCInfoServiceMethods({ stateList: [] }))
    async t2() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      vm.value.countryName = 'China';
      await vm.getState({
        name: 'China',
      });
      expect(vm.stateList).toEqual([]);
      expect(vm.saveStateOrCountry).not.toHaveBeenCalled();
    }
  }

  @testable
  class shouldShowSelectState {
    @test('should be true if country is US/Canada/Puerto Rico')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t1() {
      const vm = new E911ViewModel({});
      vm.value.country = 'US';
      expect(vm.shouldShowSelectState).toBeTruthy();

      vm.value.countryName = 'Canada';
      expect(vm.shouldShowSelectState).toBeTruthy();

      vm.value.countryName = 'Puerto Rico';
      expect(vm.shouldShowSelectState).toBeTruthy();
    }
  }

  @testable
  class getCountryInfo {
    @test(
      'should be saveStateOrCountry with user setting if user has been setting',
    )
    @mockEntity(
      createUserInfo({
        countryName: 'countryName',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods({}))
    async t1() {
      const vm = new E911ViewModel({});
      const country = {
        id: 1,
        name: 'countryName',
      };
      vm.countryList = [country];
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      jest.spyOn(vm, 'getFields');
      await vm.getCountryInfo();
      expect(vm.getFields).toHaveBeenCalled();
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', country);
      expect(vm.getState).toHaveBeenCalledWith(country);
    }

    @test('should be save with current country if not countryName in value')
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, [
      {
        method: 'getCurrentCountry',
        data: {
          id: 2,
          name: 'currentCountry',
        },
      },
    ])
    async t2() {
      const vm = new E911ViewModel({});
      const country = {
        id: 2,
        name: 'currentCountry',
      };
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      await vm.getCountryInfo();
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', country);
      expect(vm.getState).toHaveBeenCalledWith(country);
    }

    @test('should be save with default country if not match country list')
    @mockEntity(createUserInfo())
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        currentCountry: false,
      }),
    )
    async t3() {
      const vm = new E911ViewModel({});

      jest.spyOn(vm, 'getFields').mockImplementation();
      await vm.getCountryInfo();

      expect(vm.fields).toEqual({
        customerName: 'John Doe',
        street: {
          label: 'Street address',
          ghostText: '120 1st St SW',
        },
        street2: {
          label: 'Additional address',
          ghostText: 'Suite 500 or Building A, Floor 3',
          optional: true,
        },
        city: {
          label: 'City',
          ghostText: 'Alabaster',
        },
        state: {
          label: 'State/Province',
          ghostText: '',
          optional: true,
        },
        zip: {
          label: 'Zip code',
          ghostText: '35007',
        },
      });
    }
  }

  @testable
  class getCountryList {
    @test('should return undefined if country list length > 0')
    @mockEntity(createUserInfo())
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        countryList: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
      }),
    )
    async t1() {
      const vm = new E911ViewModel({});
      vm.countryList = [1];
      const ret = await vm.getCountryList();
      expect(ret).toBeUndefined();
    }

    @test('should get country list if country list === 0')
    @mockEntity(createUserInfo())
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        countryList: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
      }),
    )
    async t2() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'getCountryInfo').mockImplementation();
      await vm.getCountryList();
      expect(vm.countryList).toEqual([
        {
          id: 1,
          name: 'countryList',
        },
      ]);
      expect(vm.getCountryInfo).toHaveBeenCalled();
    }
  }

  @testable
  class countryOnChange {
    @test('should be get state if country change')
    @mockEntity(createUserInfo())
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        countryList: [
          {
            id: 1,
            name: 'countryList',
          },
        ],
        currentCountry: {},
      }),
    )
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      jest.spyOn(vm, 'getDisclaimers').mockImplementation();
      jest.spyOn(vm, 'getFields');
      await vm.getCountryInfo();
      await vm.countryOnChange({ target: { value: 'countryList' } } as any);
      expect(vm.getFields).toHaveBeenCalled();
      const country = {
        id: 1,
        name: 'countryList',
      };
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('country', country);
      expect(vm.getState).toHaveBeenCalledWith(country);
      expect(vm.getDisclaimers).toHaveBeenCalledWith(country);
    }

    @test(
      'should be reset field ghost text if country change and country !== setting',
    )
    @mockEntity(
      createUserInfo({
        countryName: 'US',
        customerName: 'customerName',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    async t2() {
      const vm = new E911ViewModel({});
      vm.countryList = [
        {
          name: 'US',
        },
        {
          name: 'CN',
        },
      ];
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      jest.spyOn(vm, 'getDisclaimers').mockImplementation();
      jest.spyOn(vm, 'getFields');
      await vm.countryOnChange({ target: { value: 'CN' } } as any);
      const { customerName, ...rest } = DEFAULT_FIELDS;
      expect(vm.value).toEqual({
        customerName: 'customerName',
        ...rest,
      });
    }

    @test(
      'should be reset user setting if country change and country === user setting',
    )
    @mockEntity(
      createUserInfo({
        countryName: 'US',
        customerName: 'customerName',
      }),
    )
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    async t3() {
      const vm = new E911ViewModel({});
      vm.countryList = [
        {
          name: 'US',
        },
        {
          name: 'CN',
        },
      ];
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      jest.spyOn(vm, 'getState').mockImplementation();
      jest.spyOn(vm, 'getDisclaimers').mockImplementation();
      jest.spyOn(vm, 'getFields');
      await vm.countryOnChange({ target: { value: 'US' } } as any);
      expect(vm.value).toEqual({
        countryName: 'US',
        customerName: 'customerName',
      });
    }
  }

  @testable
  class getFields {
    @test(
      'should be return default fields if not match isoCode and name [JPT-2678]',
    )
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    t1() {
      const vm = new E911ViewModel({});
      vm.getFields({} as any);
      expect(vm.fields).toEqual(defaultFields);
    }
  }

  @testable
  class stateOnChange {
    @test('should be save state if state change')
    @mockEntity(createUserInfo())
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        stateList: [
          {
            id: '123',
            name: 'state',
          },
        ],
      }),
    )
    t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'saveStateOrCountry').mockImplementation();
      vm.stateList = [
        {
          id: '123',
          name: 'state',
        },
      ];
      vm.stateOnChange({ target: { value: 'state' } } as any);
      expect(vm.saveStateOrCountry).toHaveBeenCalledWith('state', {
        id: '123',
        name: 'state',
      });
    }
  }

  @testable
  class saveStateOrCountry {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

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

    @test('should be name if state not isoCode')
    @mockEntity(createUserInfo())
    t2() {
      const vm = new E911ViewModel({});
      vm.saveStateOrCountry('state', {
        id: 'id',
        name: 'name',
      });
      expect(vm.value).toMatchObject({
        state: undefined,
        stateName: 'name',
        stateId: 'id',
        stateIsoCode: undefined,
      });
    }
  }

  @testable
  class handleFieldChange {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}
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
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

    @test('should be save value if field change [JPT-2710]')
    @mockEntity({
      valueSetter,
    })
    async t1() {
      const props = {
        successCallback: jest.fn(),
      };
      const vm = new E911ViewModel(props);
      await vm.onSubmit();
      expect(valueSetter).toHaveBeenCalledWith(vm.value);
      expect(props.successCallback).toHaveBeenCalled();
    }

    @test('should be clear state name/isoCode/Id if show text state')
    @mockEntity({
      valueSetter,
    })
    async t2() {
      const vm = new E911ViewModel({});
      vm.value.country = 'country';
      await vm.onSubmit();
      expect(vm.value.stateName).toBe('');
      expect(vm.value.stateIsoCode).toBe('');
      expect(vm.value.stateId).toBe('');
      expect(valueSetter).toHaveBeenCalledWith(vm.value);
    }

    @test('should be not outOfCountry if checkboxList length === 0')
    @mockEntity({
      valueSetter,
    })
    async t3() {
      const vm = new E911ViewModel({});
      await vm.onSubmit();
      expect(vm.value.outOfCountry).toBeFalsy();
    }

    @test('should be outOfCountry if checkboxList length > 0')
    @mockEntity({
      valueSetter,
    })
    async t4() {
      const vm = new E911ViewModel({});
      vm.checkboxList = [1];
      await vm.onSubmit();
      expect(vm.value.outOfCountry).toBeTruthy();
    }

    @test('should be handle error if network error [JPT-2694]')
    @mockEntity({
      valueSetter: networkErrorFunc,
    })
    async t5() {
      const vm = new E911ViewModel({});
      await vm.onSubmit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('telephony.e911.prompt.networkError'),
      );
    }

    @test('should be handle error if server error [JPT-2693]')
    @mockEntity({
      valueSetter: serverErrorFunc,
    })
    async t6() {
      const vm = new E911ViewModel({});
      await vm.onSubmit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('telephony.e911.prompt.backendError'),
      );
    }

    @test(
      'should be handle server error if submit with others server error type',
    )
    @mockEntity({
      valueSetter: serverErrorFunc,
    })
    async t7() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'handleSubmitError').mockImplementation();
      await vm.onSubmit();
      expect(vm.handleSubmitError).toHaveBeenCalled();
    }
  }

  @testable
  class handleSubmitError {
    @mockEntity(createUserInfo())
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

    @test(
      'should show flash toast with message telephony.e911.prompt.backendError if not EME-201 error',
    )
    t1() {
      const vm = new E911ViewModel({});
      vm.handleSubmitError(new JRCError('EME-202', 'test'));
      expect(Notification.flashToast).toHaveBeenCalledWith({
        message: 'telephony.e911.prompt.backendError',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      });
    }

    @test(
      'should show flash toast with message telephony.e911.prompt.errorCode201 if EME-201 error',
    )
    t2() {
      const vm = new E911ViewModel({});
      vm.handleSubmitError(new JRCError('EME-201', 'test'));
      expect(Notification.flashToast).toHaveBeenCalledWith({
        message: 'telephony.e911.prompt.errorCode201',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      });
    }

    @test('should not show flash toast if not match EME-* error')
    t3() {
      const vm = new E911ViewModel({});
      try {
        vm.handleSubmitError(
          new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
        );
      } catch (e) {
        expect(Notification.flashToast).not.toHaveBeenCalled();
        expect(e.message).toBe('GENERAL');
      }
    }
  }

  @testable
  class getRegion {
    @test('should be get region and call get disclaimers if show E911 dialog')
    @mockEntity({})
    @mockService(
      RCInfoService,
      mockRCInfoServiceMethods({
        currentCountry: {},
      }),
    )
    async t1() {
      const vm = new E911ViewModel({});
      jest.spyOn(vm, 'getDisclaimers').mockImplementation();
      await vm.getRegion();
      expect(vm.getDisclaimers).toHaveBeenCalled();
      expect(vm.region).toEqual({});
    }
  }

  @testable
  class getDisclaimers {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}
    @test(
      'should be get disclaimers and create checkbox list with original setting if get disclaimers not with country [JPT-2689][JPT-2690]',
    )
    @mockEntity(createUserInfo())
    t1() {
      const vm = new E911ViewModel({});
      vm.region = {
        name: 'United States',
      };
      jest.spyOn(vm, 'createCheckbox').mockImplementation();
      jest.spyOn(vm, 'isOutOfCountry').mockReturnValue(true);

      vm.getDisclaimers();
      expect(vm.createCheckbox).toHaveBeenCalledWith(
        OutOfCountryDisclaimer['United States'],
      );

      vm.region = {
        name: 'United Kingdom',
      };
      vm.getDisclaimers();
      expect(vm.createCheckbox).toHaveBeenCalledWith(
        OutOfCountryDisclaimer['United Kingdom'],
      );

      vm.region = {
        name: 'Canada',
      };
      vm.getDisclaimers();
      expect(vm.createCheckbox).toHaveBeenCalledWith(
        OutOfCountryDisclaimer['Canada'],
      );
    }

    @test('should be checkbox list = [] if not out of country')
    @mockEntity(createUserInfo())
    t2() {
      const vm = new E911ViewModel({});
      vm.region = {
        name: 'placeholder',
      };
      jest.spyOn(vm, 'isOutOfCountry').mockReturnValue(false);
      vm.getDisclaimers();
      expect(vm.checkboxList).toEqual([]);
    }

    @test(
      'should be get disclaimers and create checkbox list with default if not match region name [JPT-2707]',
    )
    @mockEntity(createUserInfo())
    t3() {
      const vm = new E911ViewModel({});
      vm.region = {
        name: 'China',
      };
      jest.spyOn(vm, 'createCheckbox').mockImplementation();
      jest.spyOn(vm, 'isOutOfCountry').mockReturnValue(true);
      vm.getDisclaimers();
      expect(vm.createCheckbox).toHaveBeenCalledWith(
        OutOfCountryDisclaimer.default,
      );
    }
  }

  @testable
  class isOutOfCountry {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

    @test(
      'should be out of country if user region !== last time setting country',
    )
    @mockEntity(
      createUserInfo({
        countryId: '1',
      }),
    )
    t1() {
      const vm = new E911ViewModel({});
      vm.region = {
        id: '2',
      };
      expect(vm.isOutOfCountry()).toBeTruthy();
    }

    @test(
      'should be not out of country if user region === last time setting country',
    )
    @mockEntity(
      createUserInfo({
        countryId: '1',
      }),
    )
    t2() {
      const vm = new E911ViewModel({});
      vm.region = {
        id: '1',
      };
      expect(vm.isOutOfCountry()).toBeFalsy();
    }

    @test('should be out of country if user select country !== region country')
    @mockEntity(
      createUserInfo({
        countryId: '1',
      }),
    )
    t3() {
      const vm = new E911ViewModel({});
      vm.region = {
        id: '2',
      };
      expect(
        vm.isOutOfCountry({
          id: '3',
        }),
      ).toBeTruthy();
    }

    @test(
      'should be not out of country if user select country === region country',
    )
    @mockEntity(
      createUserInfo({
        countryId: '2',
      }),
    )
    t4() {
      const vm = new E911ViewModel({});
      vm.region = {
        id: '1',
      };
      expect(
        vm.isOutOfCountry({
          id: '1',
        }),
      ).toBeFalsy();
    }
  }

  @testable
  class createCheckbox {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

    @test('should be pass params if is default disclaimers')
    @mockEntity(createUserInfo({}))
    t1() {
      const vm = new E911ViewModel({});
      vm.region = {
        id: '1',
      };
      vm.createCheckbox(OutOfCountryDisclaimer.default);
      const checkBoxList = [
        {
          i18text: 'telephony.e911.disclaimer.default',
          checked: false,
          params: {
            id: '1',
          },
        },
      ];
      expect(vm.checkboxList).toEqual(checkBoxList);
    }

    @test('should be show US/CA if out of US/CA')
    @mockEntity(createUserInfo({}))
    t2() {
      const vm = new E911ViewModel({});
      vm.createCheckbox(OutOfCountryDisclaimer['United States']);
      const checkBoxList1 = [
        {
          i18text: 'telephony.e911.disclaimer.US/CA1',
          checked: false,
        },
        {
          i18text: 'telephony.e911.disclaimer.US/CA2',
          checked: false,
        },
      ];
      expect(vm.checkboxList).toEqual(checkBoxList1);
      vm.createCheckbox(OutOfCountryDisclaimer.Canada);
      const checkBoxList2 = [
        {
          i18text: 'telephony.e911.disclaimer.US/CA1',
          checked: false,
        },
        {
          i18text: 'telephony.e911.disclaimer.US/CA2',
          checked: false,
        },
      ];
      expect(vm.checkboxList).toEqual(checkBoxList2);
    }

    @test('should be show UK disclaimer if out of UK')
    @mockEntity(createUserInfo({}))
    t3() {
      const vm = new E911ViewModel({});
      vm.createCheckbox(OutOfCountryDisclaimer['United Kingdom']);
      const checkBoxList = [
        {
          i18text: 'telephony.e911.disclaimer.UK',
          checked: false,
        },
      ];
      expect(vm.checkboxList).toEqual(checkBoxList);
    }
  }

  @testable
  class setCheckBox {
    @mockService(RCInfoService, mockRCInfoServiceMethods())
    beforeEach() {}

    @test('should be set checkbox status if call setCheckBox')
    @mockEntity(createUserInfo({}))
    t1() {
      const vm = new E911ViewModel({});
      vm.checkboxList = [
        {
          i18text: 'telephony.e911.disclaimer.US/CA1',
          checked: false,
        },
      ];
      vm.setCheckBox(0)();
      expect(vm.checkboxList).toEqual([
        {
          i18text: 'telephony.e911.disclaimer.US/CA1',
          checked: true,
        },
      ]);
    }
  }
});
