/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 10:25:35
 */

import { mockData } from './MockData';
import { logUtils } from '../utils/LogUtils';

const logger = logUtils.getLogger(__filename);

const onRequest = async (request) => {
    /*
    response <Object> Response that will fulfill this request
        status <number> Response status code, defaults to 200.
        headers <Object> Optional response headers
        contentType <string> If set, equals to setting Content-Type response header
        body <Buffer|string> Optional response body
    */
    let url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
        request.continue();
        return;
    }

    for (let item of mockData) {
        if (!item.uri.test(url.pathname)) {
            continue;
        }

        let headers = Object.assign({
            'content-type': 'application/json;charset=UTF-8',
            'access-control-allow-credentials': 'true',
            'access-control-allow-origin': process.env.JUPITER_HOST,
            'access-control-allow-methods': 'POST, PUT, GET, OPTIONS',
            'access-control-allow-headerx-frame-options': 'SAMEORIGIN'
        }, item.headers);

        logger.info(`modify response for uri[${request.method()} - ${url.pathname}]`);

        request.respond({
            status: item.status,
            headers: headers,
            contentType: item.contentType,
            body: item.body
        });
        return;
    }

    request.continue();
}

export {
    onRequest
}