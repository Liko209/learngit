/**
 * creates new object sans specified keys
 * @param {object} obj
 * @param {array|undefined} omitions
 * @return {object}
 */
export default function omit(obj, omitions = []) {
  return Object.keys(obj).reduce((memo, key) => {
    if (omitions.indexOf(key) === -1) {
      memo[key] = obj[key]; // eslint-disable-line
    }

    return memo;
  }, {});
}
