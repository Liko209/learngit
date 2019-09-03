import axios from 'axios';

export async function fetchWhiteList(isEmail: boolean) {
  try {
    if (isEmail) {
      return (await axios.get(
        `/domainWhitelist.json?timestamp=${new Date().getTime()}`,
      )).data;
    }
    return (await axios.get(
      `/whiteListedId.json?timestamp=${new Date().getTime()}`,
    )).data;
  } catch (e) {
    return {};
  }
}
