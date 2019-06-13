import path from 'path';
const fs = require('fs');
import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'src/network/network';
import url from 'url';

export default class Http {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    const { hostname } = url.parse(request.host);
    const relatePath = `${hostname}${request.path}`;
    const mockDataDirectory = path.resolve(
      __dirname,
      '../../../../../../..',
      `./testingData/http/${relatePath}`,
    );
    const isMockPathExist = fs.existsSync(mockDataDirectory);
    if (!isMockPathExist) {
      listener.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as IResponse);
      return;
    }
    if (fs.existsSync(`${mockDataDirectory}/200.json`)) {
      console.log('TCL: HTTP request -> exists', relatePath);
      const result = JSON.parse(
        fs.readFileSync(`${mockDataDirectory}/200.json`, { encoding: 'utf8' }),
      );
      // console.log('TCL: Http -> request -> result.response', result.response);
      listener.onSuccess({ request, ...result.response });
    } else {
      console.log('TCL: HTTP request -> not exists', relatePath);
      listener.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'NotFound',
        headers: {},
      } as IResponse);
    }
  }

  isNetworkReachable = () => true;

  cancelRequest() {}
}
