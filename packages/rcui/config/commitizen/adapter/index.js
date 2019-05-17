const winston = require("winston");
const buildCommit = require("./build-commit");
const { jiraPwd, getQuestions } = require("./questions");
const {
  getTicketInfo,
  saveCredential,
  removeCredential,
  checkCredentialExists
} = require("./jira-client");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  defaultMeta: { service: "user-service" },
  transports: [new winston.transports.Console()]
});

const fallbackCommit = function(cz, commit, jiraConfig, error) {
  logger.warn(error);
  logger.warn("Seems your connection to Jira failed. Fallback commit now");
  return getQuestions(jiraConfig)
    .then(cz.prompt)
    .then(buildCommit)
    .then(commit);
};
const commitFlow = function(cz, commit, jiraConfig) {
  getTicketInfo(jiraConfig)
    .then(getQuestions)
    .then(cz.prompt)
    .then(buildCommit)
    .then(commit)
    .catch(err => fallbackCommit(cz, commit, jiraConfig, err));
};

module.exports = {
  fallbackCommit,
  commitFlow,
  prompter: function(cz, commit) {
    const jiraConfig = checkCredentialExists();
    if (jiraConfig) {
      commitFlow(cz, commit, jiraConfig);
    } else {
      logger.info(
        "Your first time connect to JIRA? Set up your credentials now~"
      );
      jiraPwd()
        .then(cz.prompt)
        .then(saveCredential)
        .then(commitFlow.bind(null, cz, commit))
        .catch(removeCredential);
    }
  }
};
