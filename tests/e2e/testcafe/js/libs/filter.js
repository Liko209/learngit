"use strict";
/*
 * @Author: Potar He(Potar.He@ringcentral.com)
 * @Date: 2018-08-15 11:15:59
 * Copyright © RingCentral. All rights reserved.
 */
exports.__esModule = true;
function isValidTag(tag) {
    return /^[a-zA-Z_$][a-zA-Z_$0-9 ]*$/.test(tag);
}
function validateTag(tag) {
    if (!isValidTag(tag)) {
        throw new Error("Invalid tag value: " + tag + "!");
    }
}
function isValidName(name) {
    return /^[^\[]/.test(name);
}
function validateName(name) {
    if (!isValidName(name)) {
        throw new Error("Invalid name value: " + name + "!");
    }
}
function formalName(name, tags) {
    var formalName = name;
    validateName(formalName);
    if (tags) {
        formalName = tags
            .map(function (tag) { return tag.trim(); })
            .map(function (tag) { return validateTag(tag) || "[" + tag + "]"; })
            .join("") + " " + formalName;
    }
    return formalName;
}
exports.formalName = formalName;
function parseFormalName(formalName) {
    var tags = [];
    var rest = formalName;
    var match;
    while (match = /^\[([^\]]+?)\](.*)$/.exec(rest)) {
        tags.push(match[1]);
        rest = match[2];
    }
    return { name: rest.trim(), tags: tags };
}
exports.parseFormalName = parseFormalName;
function filterByTags(includeTags, excludeTags) {
    return function (caseName, fixtureName, fixturePath) {
        var flag = true;
        var nameTags = parseFormalName(caseName);
        if (includeTags && includeTags.length > 0) {
            flag = flag && nameTags.tags.some(function (tag) { return includeTags.some(function (includeTag) { return tag == includeTag; }); });
        }
        if (excludeTags && excludeTags.length > 0) {
            flag = flag && !nameTags.tags.some(function (tag) { return excludeTags.some(function (excludeTag) { return tag == excludeTag; }); });
        }
        return flag;
    };
}
exports.filterByTags = filterByTags;
