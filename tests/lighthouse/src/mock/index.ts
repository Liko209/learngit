/*
 * @Author: doyle.wu
 * @Date: 2019-01-02 16:55:31
 */
import { mockHelper } from "../mock/MockHelper";
import { jupiterUtils } from "../utils/JupiterUtils";
import { mockData } from "../mock/MockData";
import { Response } from "../mock/Response";
import { TokenResponse } from "../mock/TokenResponse";

const mockLoginResponse = async (redirectUrl, data) => {
  if (process.env.MOCK_GLOBAL_SWITCH !== "true") {
    return;
  }

  let code = data.authorizationCode;

  let response = await jupiterUtils.getRcToken(code, redirectUrl);
  let tokenRes = new TokenResponse();
  tokenRes.id = -1;
  tokenRes.status = 200;
  tokenRes.method = "POST";
  tokenRes.uri = /\/restapi\/oauth\/token/i;
  tokenRes.headers = new Map();
  tokenRes.body = response.data;
  mockData.set(tokenRes.id, tokenRes);

  response = await jupiterUtils.getRcCode(response.data["access_token"]);

  let res = new Response();
  res.id = -2;
  res.status = 200;
  res.method = "POST";
  res.uri = /\/restapi\/v1\.0\/interop\/generate-code/i;
  res.headers = new Map();
  res.body = response.data;
  mockData.set(res.id, res);

  response = await jupiterUtils.getRcToken(response.data["code"]);
  tokenRes.body2 = response.data;

  response = await jupiterUtils.getGlipToken(response.data);
  let headers = new Map();
  headers["Set-Cookie"] = response.headers["set-cookie"];
  headers["X-Authorization"] = response.headers["x-authorization"];
  res = new Response();
  res.id = -3;
  res.status = 200;
  res.method = "PUT";
  res.uri = /\/api\/login/i;
  res.headers = headers;
  res.body = response.data;
  mockData.set(res.id, res);
};

export { mockHelper, mockLoginResponse, mockData };
