import axios from 'axios';

export async function fetchWhiteList() {
  return (await axios.get(
    `/whiteListedId.json?timestamp=${new Date().getTime()}`,
  )).data;
}
