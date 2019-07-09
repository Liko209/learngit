import { Jupiter } from '../Jupiter';
import { container } from '../ioc';

describe('Jupiter', () => {
  afterEach(() => {
    container.unbindAll();
  });

  describe('bindProvide()', () => {
    class MyService {
      add(a: number, b: number) {
        return a + b;
      }
    }

    it('should be able to use string as key', () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(container.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);
    });

    it('should be able to use class as key', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide(MyService);
      const myService = container.get<MyService>(MyService);
      expect(myService).toBeInstanceOf(MyService);
    });
  });

  describe('bootstrapModule()', () => {
    const bootstrapFun = jest.fn();
    class MyService {
      bootstrap() {
        bootstrapFun();
      }
    }
    it('should be able bootstrap module', async () => {
      const MY_SERVICE = 'MySrv';
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MY_SERVICE,
        value: MyService,
      });
      expect(jupiter.get<MyService>(MY_SERVICE)).toBeInstanceOf(MyService);

      const afterBootstrap = jest.fn();
      await jupiter.bootstrapModule(MY_SERVICE, afterBootstrap);
      expect(bootstrapFun).toHaveBeenCalled();
      expect(afterBootstrap).toHaveBeenCalled();
      expect(container.isBound(MY_SERVICE)).toBeTruthy();
    });
  });

  describe('registerModule()', () => {
    class MyService {
      bootstrap() {}
    }
    class MyServiceProvides {}
    const myServiceModuleConfig = {
      entry: MyService,
      provides: [MyServiceProvides],
    };

    it('should be register module', () => {
      const jupiter = new Jupiter();
      jupiter.registerModule(myServiceModuleConfig);
      expect(container.isBound(MyService)).toBeTruthy();
      expect(container.isBound(MyServiceProvides)).toBeTruthy();
    });
  });

  describe('registerModuleAsync()', () => {
    class MyService {
      bootstrap() {}
    }
    class MyServiceProvides {}
    const myServiceModuleConfig = {
      entry: MyService,
      provides: [MyServiceProvides],
    };

    it('should be register module', async () => {
      const jupiter = new Jupiter();
      jupiter.registerModuleAsync(
        () => new Promise(res => res({ config: myServiceModuleConfig })),
      );
      await jupiter.bootstrap();
      expect(container.isBound(MyService)).toBeTruthy();
      expect(container.isBound(MyServiceProvides)).toBeTruthy();
    });
  });

  describe('unRegisterModule()', () => {
    const disposeFun = jest.fn();
    class MyService {}
    class MyModule {
      bootstrap() {}
      dispose() {
        disposeFun();
      }
    }
    it('should be able unRegister module', async () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide(MyModule);
      jupiter.bindProvide(MyService);
      const moduleConfig = {
        entry: MyModule,
        provides: [MyService],
      };
      expect(jupiter.get<MyModule>(MyModule)).toBeInstanceOf(MyModule);
      expect(jupiter.get<MyService>(MyService)).toBeInstanceOf(MyService);

      const afterUnregisterFun = jest.fn();
      await jupiter.unRegisterModule(moduleConfig, afterUnregisterFun);
      expect(disposeFun).toHaveBeenCalled();
      expect(afterUnregisterFun).toHaveBeenCalled();
      expect(container.isBound(MyModule)).toBeFalsy();
    });

    it('should not execute unbind when module already unRegister', async () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide(MyModule);
      jupiter.bindProvide(MyService);
      const moduleConfig = {
        entry: MyModule,
        provides: [MyService],
      };
      expect(jupiter.get<MyModule>(MyModule)).toBeInstanceOf(MyModule);
      expect(jupiter.get<MyService>(MyService)).toBeInstanceOf(MyService);

      const afterUnregisterFun = jest.fn();
      const afterUnregisterFun1 = jest.fn();
      await jupiter.unRegisterModule(moduleConfig, afterUnregisterFun);
      expect(afterUnregisterFun).toHaveBeenCalled();
      expect(container.isBound(MyModule)).toBeFalsy();

      await jupiter.unRegisterModule(moduleConfig, afterUnregisterFun1);
      expect(disposeFun).toHaveBeenCalled();
      expect(afterUnregisterFun1).not.toHaveBeenCalled();
      expect(container.isBound(MyModule)).toBeFalsy();
    });
  });
});

describe('JupiterModule', () => {
  afterEach(() => {
    container.unbindAll();
  });

  const _jupiter = new Jupiter();
  const MESSAGE_SERVICE = 'MESSAGE_SERVICE';
  const TELEPHONY_SERVICE = 'TELEPHONY_SERVICE';

  class MessageModule {
    bootstrap() {
      _jupiter.emitModuleInitial(MESSAGE_SERVICE);
    }
    disposed() {
      _jupiter.emitModuleDispose(MESSAGE_SERVICE);
    }
  }
  class MessageService {}
  class TelephonyService {}

  describe('onInitialized()', () => {
    it('should execute callback when modules already initialized', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });

      const messageServiceCallback = jest.fn();
      jupiter.onInitialized(MESSAGE_SERVICE, messageService => {
        expect(messageService).toBeInstanceOf(MessageService);
        messageServiceCallback();
      });
      expect(messageServiceCallback).toHaveBeenCalled();

      const messageNTelephonyServiceCallback = jest.fn();
      jupiter.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        (messageService, telephonyService) => {
          expect(messageService).toBeInstanceOf(MessageService);
          expect(telephonyService).toBeInstanceOf(TelephonyService);
          messageNTelephonyServiceCallback();
        },
      );
      expect(messageNTelephonyServiceCallback).toHaveBeenCalled();
    });

    it('should not execute callback when modules not all initialized', () => {
      const jupiter = new Jupiter();

      const messageServiceCallback = jest.fn();
      jupiter.onInitialized(MESSAGE_SERVICE, messageService => {
        expect(messageService).toBeInstanceOf(MessageService);
        messageServiceCallback();
      });
      expect(messageServiceCallback).not.toHaveBeenCalled();
    });

    it('should add initial listener when modules not all initialized', () => {
      const jupiter = new Jupiter();

      jupiter.onInitialized(MESSAGE_SERVICE, () => {});

      jupiter.onInitialized([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {});

      const initializedListeners = jupiter.initializedListener;
      expect(Array.from(initializedListeners).length).toEqual(2);
    });
  });

  describe('emitModuleInitial()', () => {
    it('should execute callback when module emit initial', () => {
      const messageServiceCallback = jest.fn();
      _jupiter.onInitialized(MESSAGE_SERVICE, messageService => {
        expect(messageService).toBeInstanceOf(MessageService);
        messageServiceCallback();
      });

      const messageServiceCallback1 = jest.fn();
      _jupiter.onInitialized(MESSAGE_SERVICE, messageService => {
        expect(messageService).toBeInstanceOf(MessageService);
        messageServiceCallback1();
      });

      const messageNTelephonyServiceCallback = jest.fn();
      _jupiter.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        (messageService, telephonyService) => {
          expect(messageService).toBeInstanceOf(MessageService);
          expect(telephonyService).toBeInstanceOf(TelephonyService);
          messageNTelephonyServiceCallback();
        },
      );

      const messageNTelephonyServiceCallback1 = jest.fn();
      _jupiter.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        (messageService, telephonyService) => {
          expect(messageService).toBeInstanceOf(MessageService);
          expect(telephonyService).toBeInstanceOf(TelephonyService);
          messageNTelephonyServiceCallback1();
        },
      );

      _jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      _jupiter.emitModuleInitial(MESSAGE_SERVICE);
      expect(messageServiceCallback).toHaveBeenCalledTimes(1);
      expect(messageServiceCallback1).toHaveBeenCalledTimes(1);

      _jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });
      _jupiter.emitModuleInitial(TELEPHONY_SERVICE);
      expect(messageNTelephonyServiceCallback).toHaveBeenCalledTimes(1);
      expect(messageNTelephonyServiceCallback1).toHaveBeenCalledTimes(1);
    });
    it('should execute callback once when module are initialized', () => {
      _jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });

      _jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });

      const messageServiceCallback = jest.fn();
      _jupiter.onInitialized(MESSAGE_SERVICE, messageService => {
        expect(messageService).toBeInstanceOf(MessageService);
        messageServiceCallback();
      });

      const messageNTelephonyServiceCallback = jest.fn();
      _jupiter.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        (messageService, telephonyService) => {
          expect(messageService).toBeInstanceOf(MessageService);
          expect(telephonyService).toBeInstanceOf(TelephonyService);
          messageNTelephonyServiceCallback();
        },
      );

      _jupiter.emitModuleInitial(MESSAGE_SERVICE);
      expect(messageServiceCallback).toHaveBeenCalled();
      expect(messageServiceCallback).toHaveBeenCalledTimes(1);

      _jupiter.emitModuleInitial(TELEPHONY_SERVICE);
      expect(messageNTelephonyServiceCallback).toHaveBeenCalled();
      expect(messageNTelephonyServiceCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDisposed()', () => {
    it('should execute callback when modules already unregister', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });

      const msgModuleConfig = {
        entry: MessageModule,
        provides: [{ name: MESSAGE_SERVICE, value: MessageService }],
      };

      jupiter.unRegisterModule(msgModuleConfig);

      const messageServiceCallback = jest.fn();
      jupiter.onDisposed(MESSAGE_SERVICE, () => {
        messageServiceCallback();
      });
      expect(messageServiceCallback).toHaveBeenCalled();
    });

    it('should not execute callback when modules not all unregister', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });

      const msgModuleConfig = {
        entry: MessageModule,
        provides: [{ name: MESSAGE_SERVICE, value: MessageService }],
      };

      jupiter.unRegisterModule(msgModuleConfig);

      const messageServiceCallback = jest.fn();
      jupiter.onDisposed(MESSAGE_SERVICE, () => {
        messageServiceCallback();
      });
      expect(messageServiceCallback).toHaveBeenCalled();

      const messageNTelephonyServiceCallback = jest.fn();
      jupiter.onDisposed([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {
        messageNTelephonyServiceCallback();
      });
      expect(messageNTelephonyServiceCallback).not.toHaveBeenCalled();
    });

    it('should add dispose listener when modules not all unregister', () => {
      const jupiter = new Jupiter();
      jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });

      const msgModuleConfig = {
        entry: MessageModule,
        provides: [{ name: MESSAGE_SERVICE, value: MessageService }],
      };

      jupiter.unRegisterModule(msgModuleConfig);

      jupiter.onDisposed(MESSAGE_SERVICE, () => {});

      jupiter.onDisposed([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {});

      const disposedListeners = jupiter.disposedListener;

      expect(Array.from(disposedListeners).length).toEqual(1);
    });

    it('should add dispose listener when has module not bound before', () => {
      const jupiter = new Jupiter();

      jupiter.onDisposed(MESSAGE_SERVICE, () => {});

      jupiter.onDisposed([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {});

      const disposedListeners = jupiter.disposedListener;

      expect(Array.from(disposedListeners).length).toEqual(2);
    });
  });

  describe('emitModuleDispose()', () => {
    it('should execute callback when module emit dispose', () => {
      _jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      _jupiter.unbindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      _jupiter.emitModuleDispose(MESSAGE_SERVICE);
      const messageServiceCallback = jest.fn();
      _jupiter.onDisposed(MESSAGE_SERVICE, () => {
        messageServiceCallback();
      });
      expect(messageServiceCallback).toHaveBeenCalled();

      _jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });
      const messageNTelephonyServiceCallback = jest.fn();
      _jupiter.onDisposed([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {
        messageNTelephonyServiceCallback();
      });
      _jupiter.unbindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });
      _jupiter.emitModuleDispose(TELEPHONY_SERVICE);
      expect(messageNTelephonyServiceCallback).toHaveBeenCalled();
    });
    it('should execute callback once when module are disposed', () => {
      _jupiter.bindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      _jupiter.bindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });

      const messageServiceCallback = jest.fn();
      _jupiter.onDisposed(MESSAGE_SERVICE, () => {
        messageServiceCallback();
      });
      const messageNTelephonyServiceCallback = jest.fn();
      _jupiter.onDisposed([MESSAGE_SERVICE, TELEPHONY_SERVICE], () => {
        messageNTelephonyServiceCallback();
      });

      _jupiter.unbindProvide({
        name: MESSAGE_SERVICE,
        value: MessageService,
      });
      _jupiter.emitModuleDispose(MESSAGE_SERVICE);

      _jupiter.unbindProvide({
        name: TELEPHONY_SERVICE,
        value: TelephonyService,
      });
      _jupiter.emitModuleDispose(TELEPHONY_SERVICE);

      expect(messageServiceCallback).toHaveBeenCalled();
      expect(messageServiceCallback).toHaveBeenCalledTimes(1);
      expect(messageNTelephonyServiceCallback).toHaveBeenCalled();
      expect(messageNTelephonyServiceCallback).toHaveBeenCalledTimes(1);
    });
  });
});
