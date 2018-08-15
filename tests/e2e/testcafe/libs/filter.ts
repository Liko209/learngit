/*
 * @Author: Potar He(Potar.He@ringcentral.com)
 * @Date: 2018-08-15 11:15:59
 * Copyright © RingCentral. All rights reserved.
 */

function isValidTag(tag: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z_$0-9 ]*$/.test(tag);
}

function validateTag(tag: string) {
    if (!isValidTag(tag)) {
        throw new Error(`Invalid tag value: ${tag}!`);
    }
}

function isValidName(name: string): boolean {
    return /^[^\[]/.test(name);
}

function validateName(name: string) {
    if (!isValidName(name)) {
        throw new Error(`Invalid name value: ${name}!`);
    }
}

export function formalName(name: string, tags?: Array<string>): string {
    let formalName: string = name;
    validateName(formalName);
    if (tags) {
        formalName = tags
            .map(tag => tag.trim())
            .map(tag => validateTag(tag) || `[${tag}]`)
            .join("") + " " + formalName;
    }
    return formalName;
}

export function parseFormalName(formalName: string): any {
    let tags: Array<string> = [];
    let rest = formalName;
    let match;
    while (match = /^\[([^\]]+?)\](.*)$/.exec(rest)) {
        console.log(match);
        tags.push(match[1]);
        rest = match[2];
    }
    return { name: rest.trim(), tags: tags };
}

type CaseFilter = (caseName: string, fixtureName: string, fixturePath: string) => boolean
export function filterByTags(
    includeTags?: Array<string>,
    excludeTags?: Array<string>): CaseFilter {
    return (caseName: string, fixtureName: string, fixturePath: string): boolean => {
        if (includeTags){
            for ( let tag of parseFormalName(caseName).tags){
                if ( tag in includeTags){ 
                    return true
                } 
            }
            return false}
        if (excludeTags){
            for (let tag of parseFormalName(caseName).tags){
                if (tag in excludeTags){
                    return false
                }
            }
            return true
        }
       return false 
    }
}
