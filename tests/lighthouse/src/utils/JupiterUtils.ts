/*
 * @Author: doyle.wu
 * @Date: 2018-12-19 15:48:36
 */
import axios from 'axios';
class JupiterUtils {

    async getAuthUrl(redirectUrl: string): Promise<string> {
        let url = new URL(redirectUrl);
        const state = url.pathname + url.search.replace('&', '$') + url.hash;
        const redirectUri = url.origin;
        const data = {
            state,
            username: process.env.JUPITER_USER_CREDENTIAL,
            password: process.env.JUPITER_USER_PASSWORD,
            autoLogin: false,
            ibb: '',
            sddi: '',
            prompt: 'login sso',
            display: 'touch',
            clientId: process.env.JUPITER_APP_KEY,
            appUrlScheme: redirectUri,
            responseType: 'code',
            responseHint: '',
            glipAuth: true,
            localeId: 'en_US',
            extension: process.env.JUPITER_USER_PIN
        };

        const response = await axios.post(process.env.JUPITER_LOGIN_URL, data);
        return response.data.redirectUri;
    }
}

const jupiterUtils = new JupiterUtils();

export {
    jupiterUtils
}