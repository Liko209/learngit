import axios from 'axios';

export async function fetchWhiteList() {
  return await await axios.get('/whiteListedId.json');
}
