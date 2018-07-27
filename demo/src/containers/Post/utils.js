const DECODE = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&copy;': '©',
  '&#x27;': "'",
  // '\n': '<br />',
  // '\r': '<br />',
  // Add more
};

const glipdown2html = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/\n|\r|&\S+?;/g, (match) => {
    // console.log('match: ', match);
    const char = DECODE[match];
    if (char) {
      return char;
    }
    return match;
  });
};

// <a class='at_mention_compose' rel='{"id":2266292227}'>Lip Wang</a>
const atMentionCompose = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>([^<]+)<\/a>/g;

const html2react = (str, kv = {}) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(atMentionCompose, (match, p1, p2) => {
    // console.log('match: ', match);
    // console.log('$1: ', p1);
    // console.log('$2: ', p2);
    const id = p1;
    // const text = p2;
    const text = kv[id] || p2;
    return `<a class='at_mention_compose' href='/users/${id}'>${text}</a>`;
  });
};

export { glipdown2html, html2react };

// ------------------------------------------

// /* eslint no-control-regex: "off", no-useless-escape: "off" */
// Encode and Decode  http://www.cnblogs.com/daysme/p/7100553.html
// ASCII Table  http://lwp.interglacial.com/appf_01.htm

// // "””、”&”、”‘“、”<”、”>”、sapce(0x20)、0x00-0x20、0x7F-0xFF、0x0100-0x2700
// const REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

// // &lt; === &#60;
// // const REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
// const REGX_HTML_DECODE = /\n|\r|&\w+;|&#(\w+);/g; // \w === [A-Za-z0-9_]

// // const REGX_TRIM = /(^\s*)|(\s*$)/g;

// const HTML_DECODE = {
//   '&lt;': '<',
//   '&gt;': '>',
//   '&amp;': '&',
//   '&nbsp;': ' ',
//   '&quot;': '"',
//   '&copy;': '©',
//   '&#x27;': "'",
//   '\n': '<br />',
//   '\r': '<br />',
//   // Add more
// };

// const encodeHtml = (str) => {
//   if (typeof str !== 'string') {
//     return str;
//   }
//   return str.replace(REGX_HTML_ENCODE, ($0) => {
//     let charCode = $0.charCodeAt(0);
//     charCode = charCode === 0x20 ? 0xa0 : charCode; // 0x20 === space    0xa0 === &nbsp;
//     return `&#${charCode};`; // &#60; === < === &lt;
//   });
// };

// const decodeHtml = (str) => {
//   if (typeof str !== 'string') {
//     return str;
//   }
//   return str.replace(REGX_HTML_DECODE, ($0, $1) => {
//     // console.log('$0', $0);
//     // console.log('$1', $1);
//     let char = HTML_DECODE[$0];
//     if (char) {
//       return char;
//     }
//     if (Number.isNaN($1)) {
//       char = $0;
//     } else {
//       char = String.fromCharCode($1 === 160 ? 32 : $1); // &#160; === &nbsp;    &#32; === space
//     }
//     return char;
//   });
// };

// ' === &#39; === &#x27;
// console.log(encodeHtml('<B>&\'"china</B>abc def'));
// console.log(
//   decodeHtml('&lt;B&#62;&#38;&#39;&#34;china&#60;/B&#62;abc&#160;def')
// );

// ------------------------------------------

// const decodeHtml = function (s) {
//   const HTML_DECODE = this.HTML_DECODE;

//   s = s != undefined ? s : this.toString();
//   return typeof s !== 'string'
//     ? s
//     : s.replace(this.REGX_HTML_DECODE, ($0, $1) => {
//       let c = HTML_DECODE[$0];
//       if (c == undefined) {
//         // Maybe is Entity Number
//         if (!isNaN($1)) {
//           c = String.fromCharCode($1 == 160 ? 32 : $1);
//         } else {
//           c = $0;
//         }
//       }
//       return c;
//     });
// };

// const trim = function (s) {
//   s = s != undefined ? s : this.toString();
//   return typeof s !== 'string' ? s : s.replace(this.REGX_TRIM, '');
// };

// const hashCode = function () {
//   let hash = this.__hash__,
//     _char;
//   if (hash == undefined || hash == 0) {
//     hash = 0;
//     for (let i = 0, len = this.length; i < len; i++) {
//       _char = this.charCodeAt(i);
//       hash = 31 * hash + _char;
//       hash &= hash; // Convert to 32bit integer
//     }
//     hash &= 0x7fffffff;
//   }
//   this.__hash__ = hash;

//   return this.__hash__;
// };

// ------------------------------------------

// function HTMLEncode(html) {
//   var temp = document.createElement('div');
//   temp.textContent != null
//     ? (temp.textContent = html)
//     : (temp.innerText = html);
//   var output = temp.innerHTML;
//   temp = null;
//   return output;
// }

// var tagText = '<p><b>123&456</b></p>';
// console.log(HTMLEncode(tagText)); //&lt;p&gt;&lt;b&gt;123&amp;456&lt;/b&gt;&lt;/p&gt;

// function HTMLDecode(text) {
//   var temp = document.createElement('div');
//   temp.innerHTML = text;
//   var output = temp.innerText || temp.textContent;
//   temp = null;
//   return output;
// }
// var tagText = '<p><b>123&456</b></p>';
// var encodeText = HTMLEncode(tagText);
// console.log(encodeText); //&lt;p&gt;&lt;b&gt;123&amp;456&lt;/b&gt;&lt;/p&gt;
// console.log(HTMLDecode(encodeText)); //<p><b>123&456</b></p>

// export { HTMLEncode, HTMLDecode };

// ------------------------------------------

// function html_encode(str) {
//   var s = '';
//   if (str.length == 0) return '';
//   s = str.replace(/&/g, '&gt;');
//   s = s.replace(/</g, '&lt;');
//   s = s.replace(/>/g, '&gt;');
//   s = s.replace(/ /g, '&nbsp;');
//   s = s.replace(/\'/g, '&#39;');
//   s = s.replace(/\"/g, '&quot;');
//   s = s.replace(/\n/g, '<br>');
//   return s;
// }

// function html_decode(str) {
//   var s = '';
//   if (str.length == 0) {
//     return '';
//   }
//   s = str.replace(/&gt;/g, '&');
//   s = s.replace(/&lt;/g, '<');
//   s = s.replace(/&gt;/g, '>');
//   s = s.replace(/&nbsp;/g, ' ');
//   s = s.replace(/&#39;/g, "'");
//   s = s.replace(/&quot;/g, '"');
//   s = s.replace(/<br>/g, '\n');
//   return s;
// }
