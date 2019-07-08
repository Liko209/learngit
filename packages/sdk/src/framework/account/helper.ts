import axios from 'axios';

export async function fetchWhiteList() {
  try {
    return (await axios.get(
      `/whiteListedId.json?timestamp=${new Date().getTime()}`,
    )).data;
  } catch (e) {
    return {};
  }
}
