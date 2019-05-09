const fs = require("fs");
const path = require("path");
const JiraClient = require("jira-connector");
const branch = require("git-branch");
const filePath = path.resolve("config/commitizen/jira.config.json");
module.exports = {
  checkCredentialExists: () => {
    if (fs.existsSync(filePath)) {
      return require(filePath);
    }
    return null;
  },
  saveCredential: async config => {
    await fs.writeFile(filePath, JSON.stringify(config), err => {
      if (err) throw err;
      console.log("The file was succesfully saved!");
    });
    return config;
  },
  removeCredential: async () => {
    return fs.unlinkSync(filePath);
  },
  getTicketInfo: async ({ host, username, password }) => {
    const jira = new JiraClient({
      host: host || "jira.ringcentral.com",
      basic_auth: {
        username: username,
        password: password
      }
    });
    const branchName = branch.sync();
    const ticket = branchName.split("/").slice(-1)[0];
    let summary = "";
    if (ticket.match(/^FIJI-\d+$/)) {
      try {
        summary = await new Promise((resolve, reject) =>
          jira.issue.getIssue({ issueKey: ticket }, (error, issue) => {
            if (error) {
              reject(error);
            } else {
              resolve(issue.fields.summary);
            }
          })
        );
        console.warn(summary, ticket);
        return { summary, ticket };
      } catch (err) {
        console.warn("unable to connect to jira");
        throw "unable to connect to jira";
      }
    } else {
      console.warn("please start your branch name with FIJI");
      throw "please start your branch name with FIJI";
    }
  }
};
