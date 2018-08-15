function formalCaseName(name:string,tags?:Array<string>): string{
    let tagString : string = ""
    if (tags){
        for (let i in tags){
            tagString += "[" + tags[i] + "]"
        }
        return tagString + " "+ name;
    }
    return name;
}

function parseCaseName(formalName: string): any {
    let indexPosition: number = 0;
    let tags:string[] = [];
    while (true){
        let tagStart: number = formalName.indexOf('[',indexPosition);
        let tagEnd: number = formalName.indexOf(']',tagStart);
        if (tagEnd <= indexPosition){
            break;
        }
        indexPosition = tagEnd + 1;
        let tag = formalName.slice(tagStart+1,tagEnd);
        tags.push(tag);
    }
    let name: string = formalName.slice(indexPosition);
    let caseName = {
        "name": name.replace( /^\s*/, "").replace( /\s*$/, ""),
        "tags": tags
    };
    return caseName;
}

let str = "[p1][p2] ahah  "
console.log(parseCaseName(str));
console.log(formalCaseName("ahah",['p1', 'p2']));