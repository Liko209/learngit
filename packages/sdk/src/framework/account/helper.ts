import axios from 'axios';

export async function fetchWhiteList() {
  return (await axios.get('/whiteListedId.json')).data;
}
