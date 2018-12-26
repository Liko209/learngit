export async function fetchWhiteList() {
  return await (await fetch('/whiteListedId.json')).json();
}
