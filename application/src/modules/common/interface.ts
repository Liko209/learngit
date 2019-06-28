/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
const CLIENT_SERVICE = 'window_service';
interface IClientService {
  focus: () => void;
  invokeApp: (url: string, options: InvokeAppOpts) => void;
}
interface InvokeAppOpts {
  fallback: Function;
}
export { CLIENT_SERVICE, IClientService, InvokeAppOpts };
