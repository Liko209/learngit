const http = require("http");
const https = require("https");

const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 7000;

http.createServer(function (request, response) {
    let data = "";

    request.on("data", function (chunk) {
        data += chunk;
    });

    request.on("end", function () {
        response.writeHead(201);
        response.end();
        try {
            data = JSON.parse(data);
            const options = {
                method: 'POST',
                headers: data.headers
            };
            sendRequest(data.url, options, Buffer.from(data.content || '', 'base64'));
        } catch (e) {
            const timestamp = new Date().toISOString();
            const msg = {
                requestData: data,
                error: e.toString(),
            };
            console.error(`ERROR ${timestamp} ${JSON.stringify(msg)}`);
        }
    });
}).listen(PORT, HOST);
console.log(`server is started, listening on ${HOST}:${PORT}`);

function sendRequest(url, options, content) {
    const protocol = url.startsWith("https") ? https : http;
    const request = protocol.request(url, options, function (response) {
        let result = "";
        response.setEncoding("utf8");
        response.on("data", function (chunk) {
            result += chunk;
        });
        response.on("end", function () {
            const timestamp = new Date().toISOString();
            const msg = {
                url,
                statusCode: response.statusCode,
            };
            if (response.statusCode === 200) {
                console.log(`INFO ${timestamp} ${JSON.stringify(msg)}`);
            } else {
                msg.requestHeaders = options.headers;
                msg.requestData = content;
                msg.responseHeaders = response.headers;
                msg.responseData = result;
                console.error(`ERROR ${timestamp} ${JSON.stringify(msg)}`);
            }
        });
    });

    request.on("error", function (error) {
        const timestamp = new Date().toISOString();
        const msg = {
            url,
            requestHeaders: options.headers,
            requestData: content,
        };
        console.error(`ERROR ${timestamp} ${JSON.stringify(msg)}`);
    });
    request.write(content);
    request.end();
}
