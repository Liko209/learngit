const CZ_CONFIG_PATH = "./.cz-config.js";

const czConfig = require(CZ_CONFIG_PATH);

if (!czConfig) {
  console.warn("no czConfig provided");
}

module.exports = {
  jiraPwd: async () => {
    return [
      {
        type: "input",
        name: "username",
        message:
          "[JIRA CONNECTION FAILED] Please enter your user name for JIRA",
        validate: function(value) {
          return !!value;
        },
        when: true
      },
      {
        type: "password",
        name: "password",
        message: "[JIRA CONNECTION FAILED] Please enter your password for JIRA",
        validate: function(value) {
          return !!value;
        }
      }
    ];
  },
  getQuestions: async ({ ticket, summary }) => {
    let messages = {};
    messages.host = "Please enter your JIRA Host";
    messages.type = "Select the type of change that you're committing:";
    messages.ticket = `Please input your ticket number`;
    messages.summary = `Please input the ticket summary`;
    messages.desc = `What is your change?`;

    let questions = [
      {
        type: "list",
        name: "type",
        message: messages.type,
        choices: czConfig.types
      },
      {
        type: "input",
        name: "title",
        message: messages.ticket,
        default: ticket,
        validate: function(value) {
          return !!value;
        }
      },
      {
        type: "input",
        name: "summary",
        message: messages.summary,
        default: summary,
        validate: function(value) {
          return !!value;
        }
      },
      {
        type: "input",
        name: "desc",
        message: messages.desc,
        validate: function(value) {
          return !!value;
        },
        filter: function(value) {
          return value.charAt(0).toLowerCase() + value.slice(1);
        }
      }
    ];

    return questions;
  }
};
