/**
 * Container Generator
 */

const componentExists = require("../utils/componentExists");

module.exports = {
  description: "Add a MVVM container in Application",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "What should it be called?",
      default: "Form",
      validate: value => {
        const checkPath = "../../../application/src/containers";
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
    const basePath = "../../application/src/containers/{{properCase name}}";
    const actions = [
      {
        type: "add",
        path: `${basePath}/{{properCase name}}.View.tsx`,
        templateFile: "./MVVM/view.tsx.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/{{properCase name}}.ViewModel.ts`,
        templateFile: "./MVVM/viewModel.ts.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/types.ts`,
        templateFile: "./MVVM/types.ts.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/{{properCase name}}.ts`,
        templateFile: "./MVVM/class.ts.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/index.ts`,
        templateFile: "./MVVM/index.ts.hbs",
        abortOnFail: true
      },
      {
        type: "add",
        path: `${basePath}/__tests__/{{properCase name}}.ViewModel.test.ts`,
        templateFile: "./MVVM/viewModel.test.ts.hbs",
        abortOnFail: true
      }
    ];

    return actions;
  }
};
