/* global cachedSettings */
// eslint-disable-next-line no-unused-vars
async function generateSplitterChain(inputText) {
  const {
    autoSplit, autoSummarize, autoSplitLimit, autoSplitInitialPrompt, autoSplitChunkPrompt,
  } = cachedSettings;
  if (!autoSplit) return [inputText];
  if (!autoSplitLimit) return [inputText];
  if (inputText.length < autoSplitLimit) return [inputText];
  const chunks = [];
  let text = inputText;
  let chunkNumber = 1;
  const totalChunks = Math.ceil(text.length / autoSplitLimit);
  while (text.length > autoSplitLimit) {
    const chunk = getChunk(text, autoSplitInitialPrompt, autoSplitChunkPrompt, autoSplitLimit, chunkNumber, totalChunks);
    if (!chunk) break;
    chunks.push(chunk);
    text = text.slice(chunk.length);
    chunkNumber += 1;
  }
  if (text.length > 0) {
    const chunk = getChunk(text, autoSplitInitialPrompt, autoSplitChunkPrompt, autoSplitLimit, chunkNumber, totalChunks);
    chunks.push(chunk);
  }
  if (autoSummarize) {
    chunks.push('Summarize all chunks');
  }

  return chunks;
}

function getChunk(text, autoSplitInitialPrompt, autoSplitChunkPrompt, autoSplitLimit, chunkNumber, totalChunks) {
  let chunk = '';
  if (text.length === 0) return chunk;

  // initial chunk format
  if (chunkNumber === 1) {
    chunk = autoSplitInitialPrompt;
  }

  chunk += `[START CHUNK ${chunkNumber} / ${totalChunks}]
    ${text.slice(0, autoSplitLimit)}
    [END CHUNK ${chunkNumber}/${totalChunks}]
    ${autoSplitChunkPrompt}`;

  return chunk;
}
