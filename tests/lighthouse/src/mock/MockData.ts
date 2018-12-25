/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 15:41:30
 */
const fs = require('fs');

class RequestMockData {
    uri: RegExp;
    file: string;
    body?: string;
    status?: number;
    contentType?: string;
    headers?: object = {};
}

const mockData = (() => {
    let arr: Array<RequestMockData> = [{
        uri: /initial/,
        file: 'initial.json',
    }, {
        uri: /generate-code/,
        file: 'generate-code.json',
    }, {
        uri: /api\/login/,
        file: 'login.json',
    }, {
        uri: /remaining/,
        file: 'remaining.json',
    }, {
        uri: /extension/,
        file: 'extension.json',
    }, {
        uri: /profile/,
        file: 'profile.json',
    }, {
        uri: /index/,
        file: 'index.json',
    }, {
        uri: /restapi\/oauth\/token/,
        file: 'token.json',
    },
    ];

    let body: string;
    for (let item of arr) {
        body = fs.readFileSync(`${process.cwd()}/src/mock/data/${item.file}`, 'utf-8');
        item.body = body;

        if (!item.status) {
            item.status = 200;
        }

        if (!item.contentType) {
            item.contentType = 'application/json;charset=utf-8';
        }
    }

    return arr;
})();

export {
    RequestMockData,
    mockData
}