/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-06-03 13:06:10
 * Copyright © RingCentral. All rights reserved.
 */
const { execSync } = require("child_process");
const componentExists = require("../utils/componentExists");
const currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
const separate = currentBranch.split("/");
const checkPath = "../../../tests/e2e/testcafe/configs/";
const ticketAsBranch = separate[1];

module.exports = {
  description: "Add a E2E skip config file to tests",
  prompts: [
    {
      type: "confirm",
      name: ticketAsBranch,
      message: "Do you confirmed to create e2e config file?",
      default: true,
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(checkPath, value)
            ? "A e2e config files with this name already exists"
            : true;
        }

        return "The name is required";
      }
    }
  ],
  actions: () => {
    const basePath = `../../tests/e2e/testcafe/configs/${
      separate[0]
    }/{{properCase name}}`;
    const actions = [
      {
        type: "add",
        path: `${basePath}/${ticketAsBranch}.json`,
        templateFile: "./E2E/template.hbs",
        abortOnFail: true
      }
    ];

    return actions;
  }
};
