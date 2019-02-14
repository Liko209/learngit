declare module "ringcentral-js-concise" {
  import { AxiosInstance } from "axios";

  export default class Ringcentral {
    constructor(key: string, secret: string, server: string, axiosInstance?: AxiosInstance);
  }

}
