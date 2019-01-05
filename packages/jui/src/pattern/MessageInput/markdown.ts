import { Delta, DeltaOperation, StringMap } from 'quill';

const _preInline = {
  link: (attr: StringMap, insert: any) => {
    return `[${insert}](${attr.link})`;
  },
};

const _inline = {
  italic: (attr: StringMap, insert: any) => {
    return `*${insert}*`;
  },
  bold: (attr: StringMap, insert: any) => {
    return `**${insert}**`;
  },
  code: (attr: StringMap, insert: any) => {
    return `\`${insert}\``;
  },
};

const _block = {
  header: (attr: StringMap, insert: any, extra: { ordered: number }) => {
    return `${'#'.repeat(attr.header)} ${insert}`;
  },
  blockquote: (attr: StringMap, insert: any, extra: { ordered: number }) => {
    return `> ${insert}`;
  },
  list: (attr: StringMap, insert: any, extra: { ordered: number }) => {
    extra.ordered += 1;
    switch (attr.list) {
      case 'bullet':
        return `* ${insert}`;
      case 'ordered':
        return `${extra.ordered}. ${insert}`;
    }
    return insert;
  },
};

const getLastLine = (lines: string[]) => (lines.length > 0 ? lines.pop() : '');

function markdownFromDelta(delta: Delta) {
  let block = false;
  const lines: string[] = [];
  const extra: { ordered: number } = { ordered: 0 };
  delta.forEach((op: DeltaOperation) => {
    const attr = op.attributes;
    let insert = op.insert;
    if (insert.image) {
      insert = `![](${insert.image})`;
    }

    if (insert.mention) {
      const { denotationChar, name, id } = insert.mention;
      insert = `${denotationChar}[${name}]:${id}:`;
    }

    if (attr) {
      for (const key in attr) {
        if (attr.hasOwnProperty(key) && key !== null) {
          if (key in _preInline) {
            insert = _preInline[key](attr, insert);
          }
        }
      }

      for (const key in attr) {
        if (attr.hasOwnProperty(key) && key !== null) {
          if (key in _inline) {
            insert = _inline[key](attr, insert);
          }
        }
      }

      for (const key in attr) {
        if (attr.hasOwnProperty(key) && key !== null) {
          if (key in _block) {
            if (insert === '\n') {
              insert = getLastLine(lines);
            }
            block = true;
            insert = _block[key](attr, insert, extra);
          }
        }
      }

      if (block) {
        insert = `\n${insert}`;
      }
    }
    const result = (getLastLine(lines) + insert).split('\n');
    for (const index in result) {
      lines.push(result[index]);
    }
    if (block) {
      lines.push(`${getLastLine(lines)}\n`);
    }
    if (result.length > 2 || (block && attr && !attr.list)) {
      extra.ordered = 0;
    }
    block = false;
  });
  return lines.join('\n');
}

export { markdownFromDelta };
