/*
 * @Author: doyle.wu
 * @Date: 2018-12-29 08:39:49
 */
require("dotenv").config();
import { jupiterUtils } from "./utils/JupiterUtils";
import { mockData } from "./mock/MockData";
import * as qs from "qs";

(async () => {
  let url = "https://develop.fiji.gliprc.com";
  // let response;
  // let code = await jupiterUtils.getAuthCode(url);
  // response = await jupiterUtils.getRcToken(code, url);

  // response = await jupiterUtils.getRcCode(response.data["access_token"]);

  // response = await jupiterUtils.getRcToken(response.data["code"]);

  // response = await jupiterUtils.getGlipToken(response.data);
  // console.log(response.data);
  // console.log(response.headers);
  // await jupiterUtils.getAuthUrl(url);
  console.log(mockData);
})();
