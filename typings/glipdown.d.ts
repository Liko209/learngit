declare module 'glipdown' {
  interface IMarkdown {
    global_url_regex: string;
  }

  const Markdown: IMarkdown;

  export { Markdown }
}
