import axios, { AxiosInstance,  } from "axios";
import * as querystring from 'querystring';

import { RcPlatformSdk } from "./platform";

export class GlipSdk {
    axiosClient: AxiosInstance;
    constructor(private glipServerUrl: string, private platform: RcPlatformSdk) {
        this.axiosClient = axios.create({
            baseURL: this.glipServerUrl,
        })
    }

    async authByRcToken(forMobile: boolean = true) {
        const encodedToken = Buffer.from(JSON.stringify(this.platform.token)).toString('base64');
        const url = 'api/login';
        const data = {
            for_mobile: forMobile,
            remember_me: false,
            rc_access_token_data: encodedToken,
        }
        return await this.axiosClient.put(url,querystring.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-RC-Access-Token-Data': encodedToken,
            }
        });
    }
}
