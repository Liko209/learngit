/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 15:41:30
 */
import { Response } from "./Response";
const fs = require("fs");

const getMockFile = (parent, names: Array<string>): Array<string> => {
  let mockDataPath = `${process.cwd()}/src/mock/data/${
    process.env.JUPITER_USER_CREDENTIAL
  }/${parent}`;

  if (fs.existsSync(mockDataPath)) {
    let files = fs.readdirSync(mockDataPath);

    if (files && files.length > 0) {
      names = names.concat(
        files
          .filter(v => v.endsWith(".json"))
          .map(v => `${process.env.JUPITER_USER_CREDENTIAL}/${parent}/` + v)
      );
    }
  }

  return names;
};

const mockData: Map<number, Response> = (() => {
  let map: Map<number, Response> = new Map();

  let names = getMockFile("default", new Array<string>());
  names = getMockFile(process.env.JUPITER_USER_PIN, names);

  let content: string, json;
  let response: Response;
  for (let item of names) {
    content = fs.readFileSync(
      `${process.cwd()}/src/mock/data/${item}`,
      "utf-8"
    );

    json = JSON.parse(content);

    response = new Response();
    response.id = json["id"];
    response.status = json["status"];
    response.method = json["method"];
    response.uri = new RegExp(
      json["uri"].replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"),
      "i"
    );
    response.headers = json["headers"];
    response.body = json["body"];

    map.set(response.id, response);
  }

  return map;
})();

export { mockData };
