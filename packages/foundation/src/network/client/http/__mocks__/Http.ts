import path from 'path';
const fs = require('fs');
import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'src/network/network';
import url from 'url';
import { CommonFileServer } from '../../../../../../sdk/src/__tests__/mockServer/CommonFileServer';
import { MockGlipServer } from '../../../../../../sdk/src/__tests__/mockServer/glip/MockGlipServer';
import { InstanceManager } from '../../../../../../sdk/src/__tests__/mockServer/InstanceManager';

export default class Http {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    const { hostname } = url.parse(request.host);
    const relatePath = `${hostname}${request.path}`;
    // console.log('TCL: Http -> request -> ', relatePath);
    if (hostname === 'glpdevxmn.asialab.glip.net') {
      InstanceManager.get(MockGlipServer).handle(request, listener);
    } else {
      InstanceManager.get(CommonFileServer).handle(request, listener);
    }
  }

  isNetworkReachable = () => true;

  cancelRequest() {}
}
