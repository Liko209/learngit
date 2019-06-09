import path from 'path';
const fs = require('fs');
import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'src/network/network';
import url from 'url';

export default class Socket {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    // console.log('request ===', request);
    const { hostname } = url.parse(request.host);
    const relatePath = `${hostname}${request.path}`;
    // /Users/paynter.chen/work/project/jupiter/Fiji/testingData/http/RINGCENTRAL/oauth/token/OK.json
    const mockDataDirectory = path.resolve(
      __dirname,
      '../../../../../../..',
      `./testingData/socket/${relatePath}`,
    );
    console.log('TCL: request -> xxx', mockDataDirectory);
    // const fsStat = fs.fstatSync(mockDataDirectory);
    const isMockPathExist = fs.existsSync(mockDataDirectory);
    console.log('TCL: Socket -> request -> isMockPathExist', isMockPathExist);
    if (!isMockPathExist) {
      listener.onSuccess({
        request,
        data: {},
        status: 200,
        statusText: 'Mock ok',
        headers: {},
      } as IResponse);
      return;
      // listener.onFailure({
      //   request,
      //   data: {},
      //   status: 404,
      //   statusText: 'Mock data not found',
      //   headers: {},
      // } as IResponse);
      // return;
    }
    const files = fs.readdirSync(mockDataDirectory, { withFileTypes: true });
    console.log('TCL: Http -> request -> files', files);
    // const mockSuccessFile =
    // fs.
    if (fs.existsSync(`${mockDataDirectory}/200.json`)) {
      console.log('TCL: request -> exists');
      const result = JSON.parse(
        fs.readFileSync(`${mockDataDirectory}/200.json`, { encoding: 'utf8' }),
      );
      listener.onSuccess(result.response);
    } else {
      console.log('TCL: request -> not exists', mockDataDirectory);
      listener.onFailure({
        request,
        data: {},
        status: 500,
        statusText: 'jjjj',
        headers: {},
      } as IResponse);
    }
  }

  isNetworkReachable = () => true;

  cancelRequest() {}
}
