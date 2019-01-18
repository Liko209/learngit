import { AssertionError } from "assert";

/*
 * @Author: Potar He(Potar.He@ringcentral.com)
 * @Date: 2018-08-15 11:15:59
 * Copyright © RingCentral. All rights reserved.
 */

type CaseFilter = (caseName: string, fixtureName: string, fixturePath: string) => boolean;

export interface INameTags {
  name: string;
  tags: string[];
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

export function parseFormalName(formalName: string): INameTags {
  const tags: string[] = [];
  let rest = formalName;
  let match;
  while (match = /^\[([^\]]+?)\](.*)$/.exec(rest)) {
    tags.push(match[1]);
    rest = match[2];
  }
  return { tags, name: rest.trim() };
}

export function filterByTags(
  includeTags?: string[],
  excludeTags?: string[]): CaseFilter {
  return (caseName: string, fixtureName: string, fixturePath: string): boolean => {
    let flag: boolean = true;
    const nameTags = parseFormalName(caseName);
    if (includeTags && includeTags.length > 0) {
      flag = flag && nameTags.tags.some(tag => includeTags.some(includeTag => tag === includeTag));
    }
    if (excludeTags && excludeTags.length > 0) {
      flag = flag && !nameTags.tags.some(tag => excludeTags.some(excludeTag => tag === excludeTag));
    }
    return flag;
  };
}

export function getTmtIds(tags: string[], prefix: string) {
  const reg = new RegExp(`^${prefix}-[$0-9]+$`);
  return tags.filter(tag => reg.test(tag));
}