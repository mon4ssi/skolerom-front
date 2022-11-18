export const replaceQuotes = (currentObj: HTMLTextAreaElement | HTMLInputElement): void => {
  const newQuote = '«»';
  const doubleQuote = '"';
  const singleQuote = "'";

  const startKeyCode = currentObj!.selectionStart;
  currentObj!.value =  currentObj.value.replace(doubleQuote, newQuote).replace(singleQuote, newQuote);
  currentObj!.selectionEnd = startKeyCode;
  currentObj!.focus();
};
