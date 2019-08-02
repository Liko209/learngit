import { DeltaStatic, DeltaOperation, StringMap } from 'quill';

const _preInline = {
  link: (attr: StringMap, insert: any) => `[${insert}](${attr.link})`,
};

const _inline = {
  italic: (attr: StringMap, insert: any) => `*${insert}*`,
  bold: (attr: StringMap, insert: any) => `**${insert}**`,
  code: (attr: StringMap, insert: any) => `\`${insert}\``,
};

const _block = {
  header: (attr: StringMap, insert: any) =>
    `${'#'.repeat(attr.header)} ${insert}`,
  blockquote: (attr: StringMap, insert: any) => `> ${insert}`,
  list: (attr: StringMap, insert: any, extra: { ordered: number }) => {
    extra.ordered += 1;
    switch (attr.list) {
      case 'bullet':
        return `* ${insert}`;
      case 'ordered':
        return `${extra.ordered}. ${insert}`;
      default:
        break;
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
  const ops = (delta && delta.ops) || [];
  ops.forEach((op: DeltaOperation, idx: number, self: DeltaOperation[]) => {
    const attr = op.attributes;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    let insert = op.insert;
    const lastElement: number = self.length - 1;
    if (lastElement === idx) {
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
        if (hasOwnProperty.call(attr, key) && key !== null) {
          if (key in _preInline) {
            insert = _preInline[key](attr, insert);
          }
        }
      }

      for (const key in attr) {
        if (hasOwnProperty.call(attr, key) && key !== null) {
          if (key in _inline) {
            insert = _inline[key](attr, insert);
          }
        }
      }

      for (const key in attr) {
        if (hasOwnProperty.call(attr, key) && key !== null) {
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
      if (Object.prototype.hasOwnProperty.call(result, index)) {
        lines.push(result[index]);
      }
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
