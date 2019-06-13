import nock from 'nock';
import Axios from 'axios';
import _ from 'lodash';
import path from 'path';
const fs = require('fs');
import url from 'url';
// import 'mitm';
type RouterHandler = (path: string, body: any, cb: ReplyCallback) => void;

type ReplyCallback = (error: any, response: [number, any?, {}?]) => void;

type PathMatcher = (routePath: string, path: string) => boolean;
class Router {
  private _routes: {
    [key: string]: { path: string; handler: RouterHandler }[];
  } = {};

  constructor(
    public pathMatcher: PathMatcher = (routerPath, path) => routerPath === path,
  ) {}

  setPathMatcher(matcher: PathMatcher) {
    this.pathMatcher = matcher;
  }

  dispatch(method: string, path: string, requestBody: any, cb: ReplyCallback) {
    console.log('TCL: Router -> dispatch -> method', method, path);
    const array = this._routes[method] || [];
    const target = _.find(array, it => this.pathMatcher(it.path, path));
    if (target) {
      target.handler(path, requestBody, cb);
    } else {
      cb(null, [404, 'mock: Route Not Found']);
    }
  }

  use(method: string, path: string, handler: RouterHandler) {
    this._routes[method] = this._routes[method] || [];
    this._routes[method].push({
      path,
      handler,
    });
    return this;
  }
}

// // nock('https://app.launchdarkly.com')
// //   .get(/.*/)
// //   .reply(200, 'test xxxx');
// Axios.get('https://app.launchdarkly.com/sdk')
//   .catch(error => {
//     console.log('TCL: error', error);
//   })
//   .then(result => {
//     console.log('TCL: result', result);
//   });
// Axios.put('https://app.launchdarkly.com/aaaa')
//   .catch(error => {
//     console.log('TCL: error', error);
//   })
//   .then(result => {
//     console.log('TCL: result', result);
//   });
// Axios.get('https://app.launchdarkly.com')
//   .catch(error => {
//     console.log('TCL: error 2', error);
//   })
//   .then(result => {
//     console.log('TCL: result', result);
//   });

// applyMockServer({
//   host: 'https://app.launchdarkly.com',
//   api: [
//     path: '/sdk',
//     method: 'get',
//     handle: async (url, requestBody) => {
//     console.log('TCL: url, requestBody', url, requestBody);
//       return {

//       };
//     },
//   ],
// });

// import mock from 'xhr-mock';
// console.log('TCL: mock', mock);
// mock.setup();
// mock.use((req, res) => {
//   console.log('TCL: req, res', req, res);
//   return res
//     .status(200)
//     .reason('OK')
//     .header('Content-Length', '12')
//     .body('Hello World!');
// });

// Axios.get('/');
// Axios.get('https://app.launchdarkly.com/xxx');
// Axios.post('https://app.launchdarkly.com/xxx');
// Axios.get('https://app.launchdarkly.com')
//   .catch(error => {
//     console.log('TCL: error 2', error);
//   })
//   .then(result => {
//     console.log('TCL: result', result);
//   });
// type API = {
//   [path: string | RegExp]: (uri: string, requestBody: any, cb: () => void) => void;
// }
interface IApiHandler {
  handle: (uri: string, requestBody: any) => Promise<any>;
}

type HttpMethod = 'get' | 'put' | 'post';

// class SocketServer {

// }

type Api = {};

interface IMockServer {
  host: string;
  // api: [{ path: string | RegExp; method: HttpMethod; handler: IApiHandler }];
  getRouter: () => Router;
}

class MockFileServer implements IMockServer {
  private _router: Router;
  // init() {}

  // getInitial() {
  //   return;
  // }

  // createPost(body: any) {
  //   // const post = parse(body);
  //   //
  // }
  constructor(public host: string) {
    this._router = new Router((routePath, path) => {
      console.log(
        this.host,
        'TCL: MockFileServer -> constructor -> path',
        path,
      );
      return this.isExist(path);
    });

    this._router.use('get', '*', this.handler);
    this._router.use('post', '*', this.handler);
  }

  handler = (uri, body, cb) => {
    const result = JSON.parse(
      fs.readFileSync(`${this.getMockJsonPath(uri)}`, {
        encoding: 'utf8',
      }),
    );
    // console.log('TCL: MockFileServer -> constructor -> result', result);
    cb(null, [200, result.response.data]);
  }

  isExist = (uri: string) => {
    const isMockPathExist = fs.existsSync(this.getMockJsonPath(uri));
    return isMockPathExist;
  }

  getMockJsonPath = (uri: string) => {
    const { hostname } = url.parse(this.host);
    const relatePath = `${hostname}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../',
      `./testingData/http/${relatePath}/200.json`,
    );
    // console.log('TCL: Router -> getMockJsonPath -> mockDataPath', mockDataPath);
    return mockDataPath;
  }

  getRouter = () => this._router;
}

function applyMockServer(server: IMockServer) {
  // const router = server.getRouter();
  // const api: Map<string | RegExp, IApiHandler>;

  nock(server.host)
    // .get(/.*/)
    .intercept(/.*/, 'get')
    .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
      server.getRouter().dispatch('get', uri, requestBody, cb),
    )
    .intercept(/.*/, 'put')
    .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
      server.getRouter().dispatch('put', uri, requestBody, cb),
    )
    .intercept(/.*/, 'post')
    .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
      server.getRouter().dispatch('post', uri, requestBody, cb),
    );
}
// { url: 'https://api-glpdevxmn.lab.nordigy.ru/restapi',
// "url": "https://api-glpdevxmn.lab.nordigy.ru/restapi/v1.0/client-info",

applyMockServer(new MockFileServer('https://api-glpdevxmn.lab.nordigy.ru'));
applyMockServer(new MockFileServer('https://glpdevxmn.asialab.glip.net'));

// const router = new Router();

// nock(/.*/)
//   // .get(/.*/)
//   .intercept(/.*/, 'get')
//   .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
//     router.dispatch('get', uri, requestBody, cb),
//   )
//   .intercept(/.*/, 'put')
//   .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
//     router.dispatch('put', uri, requestBody, cb),
//   )
//   .intercept(/.*/, 'post')
//   .reply((uri: string, requestBody: any, cb: ReplyCallback) =>
//     router.dispatch('post', uri, requestBody, cb),
//   );
