jest.mock('downshift');
jest.mock('@/modules/telephony/HOC');

jest.mock('event-source-polyfill');
jest.mock('filestack-js');
jest.mock('libphonenumber-js');
jest.mock('react-resize-detector');
jest.mock('ua-parser-js');

jest.mock('moize', () => {
  const moize = x => x;
  moize.promise = func => {
    function p() {
      /* eslint-disable */
      return Promise.resolve(Reflect.apply(func, null, arguments));
    }
    return func ? p : Promise.resolve;
  };
  return moize;
});

jest.mock('react-quill');
jest.mock('quill');
// jest.mock('jui/pattern/MessageInput/MessageInput');
// jest.mock('jui/pattern/MessageInput/Mention');

jest.mock('pubnub', () => {
  const mock = {
    stop: jest.fn(),
    unsubscribeAll: jest.fn(),
    addListener: jest.fn(),
    subscribe: jest.fn(),
    decrypt: jest.fn(),
  };
  return () => mock;
});

jest.mock('dexie-export-import', () => {
  return {
    importDB: jest.fn(),
    exportDB: jest.fn(),
  };
});
