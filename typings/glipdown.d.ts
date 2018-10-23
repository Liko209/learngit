declare module 'glipdown' {
  interface IMarkdown {
    global_url_regex: string;
    (raw: string, options?: string): string;
    Markdown: IMarkdown;
  }

  const Markdown: IMarkdown;

  export { Markdown };
}
