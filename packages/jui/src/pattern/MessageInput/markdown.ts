import { DeltaStatic, DeltaOperation, StringMap } from 'quill';

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

function markdownFromDelta(delta: DeltaStatic) {
  let block = false;
  const lines: string[] = [];
  const extra: { ordered: number } = { ordered: 0 };
  const mentionIds: number[] = [];
  const ops = delta && delta.ops || [];
  ops.forEach((op: DeltaOperation, index: number, ops: DeltaOperation[]) => {
    const attr = op.attributes;
    let insert = op.insert;
    const lastElement: number = ops.length - 1;
    if (lastElement === index) {
      insert = insert.replace(/[\n\r]$/, '');
    }
    if (insert.image) {
      insert = `![](${insert.image})`;
    }

    if (insert.mention) {
      const { denotationChar, name, id } = insert.mention;
      mentionIds.push(Number(id));
      insert = `<a class='at_mention_compose' rel='{"id":${id}}'>${denotationChar}${name}</a>`;
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
  return {
    mentionIds,
    content: lines.join('\n'),
  };
}

export { markdownFromDelta };
