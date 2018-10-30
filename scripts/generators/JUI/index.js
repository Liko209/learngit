/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-30 17:40:59
 * Copyright © RingCentral. All rights reserved.
 */

const componentExists = require("../utils/componentExists");

module.exports = {
  description: "Add a MVVM container in Application",
  prompts: [
    {
      type: "list",
      name: "type",
      message: "Select the type of JUI",
      default: "Components",
      choices: () => ["Components", "Pattern"]
    },
    {
      type: "input",
      name: "name",
      message: "What should it be called?",
      default: "Form",
      validate: (value, answer) => {
        const checkPath = `../../../packages/jui/src/${answer.type.toLowerCase()}`;
        if (/.+/.test(value)) {
          return componentExists(checkPath, value)
            ? "A container with this name already exists"
            : true;
        }

        return "The name is required";
      }
    }
  ],
  actions: data => {
    const basePath =
      "../../packages/jui/src/{{camelCase type}}/{{properCase name}}";
    const actions = [
      {
        type: "add",
        path: `${basePath}/{{properCase name}}.tsx`,
        templateFile: "./JUI/class.tsx.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/index.ts`,
        templateFile: "./JUI/index.ts.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/__stories__/{{properCase name}}.story.tsx`,
        templateFile: "./JUI/story.tsx.hbs",
        abortOnFail: true
      }
    ];

    return actions;
  }
};
