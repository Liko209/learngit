/*
 * @Author: doyle.wu
 * @Date: 2019-06-19 09:17:14
 */

import axios from 'axios';
import * as https from 'https';
import { LocationOfCode, SourceCode } from './model';

const beautify = require('js-beautify');
const sourceMap = require('source-map');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const JSXParser = acorn.Parser.extend(jsx());

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const contentMap: { [key: string]: string } = {};

const getContent = async (url: string): Promise<string> => {
  if (!url) {
    return undefined;
  }

  if (contentMap[url]) {
    return contentMap[url];
  }

  try {
    const response = await instance.get(url);
    contentMap[url] = response.data
    return contentMap[url];
  } catch (err) {
    return undefined;
  }
}

const getSourceMapUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\.js$/, '.js.map')}${u.search}`;
  } catch (err) {
    return undefined;
  }
}

const insertHelpers = (node, parent, chunks) => {
  node.parent = parent;
  if (parent) {
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(node);
  }

  node.source = () => {
    return chunks.slice(node.start, node.end).join('');
  };

  let update = (s) => {
    chunks[node.start] = s;
    for (let i = node.start + 1; i < node.end; i++) {
      chunks[i] = '';
    }
  }

  node.update = update;
}

const travel = (node, parent, chunks) => {
  insertHelpers(node, parent, chunks);

  Object.keys(node).forEach(key => {
    if (key === 'parent') {
      return;
    }

    let child = node[key];
    if (child) {
      if (child instanceof Array) {
        for (let c of child) {
          if (c && typeof c.type === 'string') {
            travel(c, node, chunks);
          }
        }
      } else if (typeof child.type === 'string') {
        travel(child, node, chunks);
      }
    }
  });
}

const findSouceNode = (item: LocationOfCode, root) => {
  let children, prev, loc;
  let line = item.line, column = item.column;
  let next = root;

  while (next) {
    prev = next;
    next = undefined;

    children = prev.children;
    if (!children) {
      continue;
    }

    for (let child of children) {
      loc = child.loc;
      if (loc.start.line <= line && loc.start.column <= column
        && (
          (loc.end.line == line && loc.end.column >= column) || loc.end.line > line
        )) {
        next = child;
        break;
      }
    }
  }

  if (prev.parent) {
    prev = prev.parent;
  }

  return prev;
}

const updateCode = (node, map) => {
  let stack = [node], next, origin, children;
  while (stack.length) {
    next = stack.pop();
    origin = map.originalPositionFor({ line: next.loc.start.line, column: next.loc.start.column });

    if (next.type === 'Identifier') {
      if (origin.name) {
        next.update(origin.name);
      }
    }

    children = next.children;
    if (children) {
      for (let child of children) {
        stack.push(child);
      }
    }
  }
}

const summariseTimeoutCode = async (timeoutCodeMap: { [key: string]: LocationOfCode }): Promise<Array<SourceCode>> => {
  let keys = Object.keys(timeoutCodeMap);
  let item: LocationOfCode;
  let script, mapContent;
  let root, codeMap, chunks, node, filePath, code, origin;
  const result: Array<SourceCode> = [];

  for (let key of keys) {
    item = timeoutCodeMap[key];

    root = undefined;
    codeMap = undefined;
    script = await getContent(item.url);
    mapContent = await getContent(getSourceMapUrl(item.url));

    if (!script) {
      continue;
    }

    try {
      root = JSXParser.parse(script, { locations: true });
    } catch (err) {
      continue;
    }
    chunks = script.split('');

    travel(root, undefined, chunks);

    if (mapContent) {
      codeMap = await (new sourceMap.SourceMapConsumer(mapContent));
    }

    node = findSouceNode(item, root);

    filePath = item.url;
    if (codeMap) {
      origin = codeMap.originalPositionFor({ line: node.loc.start.line, column: node.loc.start.column });
      filePath = origin.source;

      updateCode(node, codeMap);
    }

    code = beautify(node.source());
    result.push(<SourceCode>{ filePath, code, during: item.during });
  }

  return result;
}

export {
  summariseTimeoutCode
}
