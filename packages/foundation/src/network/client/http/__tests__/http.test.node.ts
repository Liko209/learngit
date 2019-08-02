import Http from '../Http';
import {
  getFakeRequest,
  getFakeExecutor,
  getFakeNetworkRequestExecutorListener,
} from '../../../__tests__/utils';
import axios from 'axios';
import { NETWORK_FAIL_TEXT, RESPONSE_STATUS_CODE } from '../../../network';

class MockCancel {
  constructor(public message: string) {}
}

function sleep(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    },         time);
  });
}

jest.mock('axios', () => {
  const a = jest.fn().mockImplementation(() => {
    return Promise.resolve();
  });
  return a;
});

const http = new Http();

describe('Http client', () => {
  beforeEach(() => {
    axios.Cancel = MockCancel;
    axios.CancelToken = {
      source: () => () => {},
    };
  });
  describe('request', () => {
    it('should set to tasks', () => {
      const request = getFakeRequest();
      http.request(request, getFakeExecutor());
      expect(http.tasks.get(request.id)).toEqual(request);
    });
  });
  describe('request failure', () => {
    it.each`
      code              | message                                  | response                              | status                                 | statusText
      ${'ECONNABORTED'} | ${'Request aborted'}                     | ${undefined}                          | ${RESPONSE_STATUS_CODE.LOCAL_ABORTED}  | ${'Request aborted'}
      ${null}           | ${'Network Error'}                       | ${undefined}                          | ${RESPONSE_STATUS_CODE.NETWORK_ERROR}  | ${'Network Error'}
      ${'ECONNABORTED'} | ${'timeout of 5000ms exceeded'}          | ${undefined}                          | ${RESPONSE_STATUS_CODE.LOCAL_TIME_OUT} | ${'timeout of 5000ms exceeded'}
      ${null}           | ${'Request failed with status code 403'} | ${{ status: 403, statusText: 'xxx' }} | ${403}                                 | ${'xxx'}
    `(
      'should return \n{\n status: $status,\n statusText: $statusText\n}\nwhen \n{\n code:$code,\n message:$message,\n response:$response,\n}',
      async ({ code, message, response, status, statusText }) => {
        (axios as jest.Mock).mockRejectedValue({
          code,
          response,
          message,
          config: {},
        });
        const request = getFakeRequest();
        const listener = getFakeNetworkRequestExecutorListener();
        let res = {};
        (listener.onFailure as jest.Mock).mockImplementation(params => {
          res = params;
        });
        http.request(request, listener);
        await sleep(0);
        expect(listener.onFailure).toBeCalled();
        expect(res['status']).toEqual(status);
        expect(res['statusText']).toEqual(statusText);
      },
    );
    it('should parse cancel error', async () => {
      const mockCancelError = new MockCancel('test cancel');
      (axios as jest.Mock).mockRejectedValue(mockCancelError);
      const request = getFakeRequest();
      const listener = getFakeNetworkRequestExecutorListener();
      let res = {};
      (listener.onFailure as jest.Mock).mockImplementation(params => {
        res = params;
      });
      http.request(request, listener);
      await sleep(0);
      expect(listener.onFailure).toBeCalled();
      expect(res['status']).toEqual(RESPONSE_STATUS_CODE.LOCAL_CANCELLED);
      expect(res['statusText']).toEqual(NETWORK_FAIL_TEXT.CANCELLED);
    });
  });
});
