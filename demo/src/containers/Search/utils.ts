/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:11:34
 * Copyright © RingCentral. All rights reserved.
 */

type SanitizeTextHelper = (raw: string) => string;

type CombineChunks = (params: { chunks: MatchedChunk[] }) => MatchedChunk[];

type FillInChunks = (
  params: { chunksToHighlight: MatchedChunk[]; totalLength: number }
) => AllChunks[];

interface AllChunks extends MatchedChunk {
  highlight: boolean;
}

interface MatchedChunk {
  start: number;
  end: number;
}

const removePunctuationForSearch: SanitizeTextHelper = function(text) {
  return text.replace(/[\x3a-\x40\x5b-\x60\x7b-\x7f]/g, ' ');
};

const removeHTMLForSearch: SanitizeTextHelper = function(text) {
  return text.replace(/(<[^>]*>)/g, function(_, text) {
    return new Array(text.length + 1).join(' ');
  });
};

const removeEmojiForSearch: SanitizeTextHelper = function(text) {
  // TODO:
  return text;
};

const sanitize_for_search_match: SanitizeTextHelper = function(text) {
  const removedUnderline = text.toLowerCase().replace(/__/g, '  ');
  const removedHtml = removeHTMLForSearch(removedUnderline);
  const removedEmoji = removeEmojiForSearch(removedHtml);
  return removePunctuationForSearch(removedEmoji);
};
const searchRegExpBuilder = (
  pattern: string,
  caseSensitive?: Boolean
): RegExp => {
  const regexp = pattern
    .replace(/[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/g, '') //eslint-disable-line
    .replace(/[\[\]\\{}()+*?.$^|]/g, '');
  return new RegExp(regexp, caseSensitive ? 'g' : 'gi');
};

const findChunks = (text: string, queries: string[]) => {
  const cleaned_text = sanitize_for_search_match(text);
  return queries
    .filter(query => query)
    .reduce((chunks: MatchedChunk[], searchWord: string) => {
      const regex = searchRegExpBuilder(searchWord);
      let match;
      while ((match = regex.exec(cleaned_text))) {
        let start = match.index;
        let end = regex.lastIndex;
        if (end > start) {
          chunks.push({ start, end });
        }
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
      return chunks;
    }, []);
};

const combineChunks: CombineChunks = ({ chunks }) => {
  return chunks
    .sort((first, second) => first.start - second.start)
    .reduce((processedChunks, nextChunk) => {
      // First chunk just goes straight in the array...
      if (!isArrayPopable<MatchedChunk>(processedChunks)) {
        return [nextChunk];
      } else {
        // ... subsequent chunks get checked to see if they overlap...
        const prevChunk: MatchedChunk = processedChunks.pop()!;
        if (nextChunk.start <= prevChunk.end) {
          // It may be the case that prevChunk completely surrounds nextChunk, so take the
          // largest of the end indeces.
          const endIndex = Math.max(prevChunk.end, nextChunk.end);
          processedChunks.push({ start: prevChunk.start, end: endIndex });
        } else {
          processedChunks.push(prevChunk, nextChunk);
        }
        return processedChunks;
      }
    }, []);
};
const fillInChunks: FillInChunks = ({ chunksToHighlight, totalLength }) => {
  const allChunks: AllChunks[] = [];
  const append = (start: number, end: number, highlight: boolean) => {
    if (end - start > 0) {
      allChunks.push({
        start,
        end,
        highlight
      });
    }
  };

  if (chunksToHighlight.length === 0) {
    append(0, totalLength, false);
  } else {
    let lastIndex = 0;
    chunksToHighlight.forEach(chunk => {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    });
    append(lastIndex, totalLength, false);
  }
  return allChunks;
};

const findAll = (textToHighLight: string, queries: string[]) => {
  const chunks = findChunks(textToHighLight, queries);
  const combinedChunks = combineChunks({ chunks });
  return fillInChunks({
    chunksToHighlight: combinedChunks,
    totalLength: textToHighLight.length
  });
};

function isArrayPopable<T>(array: Array<T>): array is Array<T> & { pop(): T } {
  return array.length !== 0;
}

export { findAll };
