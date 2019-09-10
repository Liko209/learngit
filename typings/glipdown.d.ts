declare module 'glipdown' {
  interface IMarkdown {
    tld_url_regex: RegExp;
    global_url_regex: RegExp;
    (raw: string, options?: string): string;
    Markdown: IMarkdown;
  }

  const Markdown: IMarkdown;

  const Remove_Markdown: (raw: string, options?: object) => string;

  export { Markdown, Remove_Markdown };
}
