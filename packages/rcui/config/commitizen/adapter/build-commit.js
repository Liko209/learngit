module.exports = function buildCommit(answers) {
  function addTicketInfo(title, summary) {
    return `(${title.trim()}): [${summary.trim()}] `;
  }

  function escapeSpecialChars(result) {
    var specialChars = ["`"];

    specialChars.map(function(item) {
      // For some strange reason, we have to pass additional '\' slash to commitizen. Total slashes are 4.
      // If user types "feat: `string`", the commit preview should show "feat: `\\string\\`".
      // Don't worry. The git log will be "feat: `string`"
      result = result.replace(new RegExp(item, "g"), "\\\\`");
    });
    return result;
  }

  // Hard limit this line
  var result =
    answers.type + addTicketInfo(answers.title, answers.summary) + answers.desc;

  return escapeSpecialChars(result);
};
