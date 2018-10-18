import axios, { AxiosInstance,  } from "axios";
import * as querystring from 'querystring';

import { RcPlatformSdk } from "./platform";

export class GlipSdk {
    axiosClient: AxiosInstance;
    accessToken: string;
    headers: object;

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

    async auth(forMobile: boolean = true){
        const res =  await this.authByRcToken(forMobile)
        this.accessToken = res["headers"]["x-authorization"]
        this.headers = {
            accept: 'application/json',
            authorization: "Bearer " +this.accessToken,
            'content-type': 'application/json'
        }
    }

    getPerson(personId){
        const uri = `api/person/${personId}`
        return this.axiosClient.get(uri, {
            headers: this.headers,
        });
    }

    updatePerson(personId, personDict: object){
        const uri = `api/person/${personId}`
        return this.axiosClient.put(uri, personDict, {
            headers: this.headers,
        });
    }

    //need system user auth token
    deactivated(personId){
        this.updatePerson(personId, { "deactivated": true });
    }

    getTeams(){
        const uri = `api/teams`
        return this.axiosClient.get(uri, {
            headers: this.headers,
        });
    }
    
    createTeam(name, memebersByGlipId: number[]){
        const uri = `api/team`
        const data = {
            "is_team": true,
            "is_public": false,
            "members": memebersByGlipId,
            "set_abbreviation": name
          }
          return this.axiosClient.post(uri, data, {
            headers: this.headers,
        });
    }

    //bug
    sendPost(groupId, text){
        const uri = "api/post"
        const data = {
            "group_id": groupId,
            "is_new": true,
            "is_sms": true,
            "source": "api",
            "text": text
          }
          return this.axiosClient.post(uri, data, {
            headers: this.headers,
        });
      }
}