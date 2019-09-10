/*
 * @Author: Potar.He
 * @Date: 2019-04-10 17:37:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-06-09 10:53:54
 */
import { AssertionError } from "assert";
import * as assert from "assert";
import { ITestMeta } from "../v2/models";
import * as _ from "lodash";
import * as fs from "fs";
import { compileExpression } from "filtrex";

type CaseFilter = (caseName: string, fixtureName: string, fixturePath: string, testMeta: any, fixtureMeta: any) => boolean;

export interface INameTags {
  name: string;
  tags: string[];
}

export function readTestLog(testLogFile: string, ): Set<string> {
  try {
    return new Set(
      fs.readFileSync(testLogFile, { encoding: 'utf-8' }).split('\n')
    )
  } catch (e) {
    return null;
  }
}

function isValidTag(tag: string, breakOnError: boolean = false): boolean {
  const isValid = /^[a-zA-Z_$][a-zA-Z_\-$0-9\. ]*$/.test(tag);
  if (!isValid && breakOnError)
    throw new AssertionError({ message: `Invalid Tag: ${tag}` });
  return isValid;
}

function isValidName(name: string): boolean {
  return /^[^\[]/.test(name);
}

function validateName(name: string) {
  if (!isValidName(name)) {
    throw new Error(`Invalid name value: ${name}!`);
  }
}

export function formalName(name: string, tags?: string[]): string {
  let formalName: string = name;
  validateName(formalName);
  if (tags) {
    formalName = tags
      .map(tag => tag.trim())
      .map(tag => isValidTag(tag, true) && `[${tag}]`)
      .join('') + ' ' + formalName;
  }
  return formalName;
}

export function formalNameWithTestMetaPrefix(name: string, testMeta: ITestMeta): string {
  let formalName: string = name;
  const tags = [].concat(testMeta.priority, testMeta.caseIds);
  if (tags.length > 0) {
    formalName = tags
      .filter(tag => tag)
      .map(tag => tag.trim())
      .map(tag => isValidTag(tag, true) && `[${tag}]`)
      .join('') + ' ' + formalName;
  }
  return formalName.trim();
}

export function parseFormalName(formalName: string): INameTags {
  const tags: string[] = [];
  let rest = formalName;
  const matchs = formalName.match(/(?<=^|\])\[[^\[\]]+\]/g);
  for (const i in matchs) {
    const match = /^\[([^\]]+?)\](.*)$/.exec(rest)
    if (match) {
      tags.push(match[1]);
      rest = match[2];
    }
  }
  return { tags, name: rest.trim() };
}


export function filterByTags(includeTags: string[], excludeTags: string[], query?: string, testLog?: Set<string>): CaseFilter {
  let compiledFilter = null;
  try {
    compiledFilter = compileExpression(query);
  } catch (e) { }

  return (caseName: string, fixtureName: string, fixturePath: string, testMeta: any, fixtureMeta: any): boolean => {
    // ensure at least one test is selected, or else testcafe will throw errors
    if (caseName === 'dummy test') return true;
    // skip if the case has already passed
    if (testLog && testLog.has(JSON.stringify([fixtureName, caseName]))) return false;
    // get tags
    const nameTags = parseFormalName(caseName);
    const testMetaTags = getTagsFromMeta(testMeta);
    // if query is existed, return query result
    if (compiledFilter) {
      return compiledFilter({ caseName: nameTags.name, fixtureName, fixturePath, testMeta, fixtureMeta, tags: [...nameTags.tags, ...testMetaTags]}) > 0;
    }
    // simple tag based filter
    let flag: boolean = true;
    if (includeTags && includeTags.length > 0) {
      flag = flag && hasAtLeastOneTagInTargetLists(includeTags, nameTags.tags, testMetaTags);
    }
    if (excludeTags && excludeTags.length > 0) {
      flag = flag && !hasAtLeastOneTagInTargetLists(excludeTags, nameTags.tags, testMetaTags);
    }
    return flag;
  }
}

function getTagsFromMeta(meta: ITestMeta) {
  let tags = [];
  for (const key in meta) {
    tags = _.union(tags, meta[key]);
  }
  return tags;
}

function hasAtLeastOneTagInTargetLists(tags: string[], ...targetLists) {
  let flag: boolean;
  assert.ok(targetLists.length > 0, 'required target tags')
  for (const targetList of targetLists) {
    if (targetList) {
      flag = flag || tags.some(tag => targetList.some(item => tag.toLowerCase() == item.toLowerCase()));
    }
  }
  return flag;
}

export function getTmtIds(tags: string[], prefix: string) {
  const reg = new RegExp(`^${prefix}-[$0-9]+$`);
  return tags.filter(tag => reg.test(tag));
}
