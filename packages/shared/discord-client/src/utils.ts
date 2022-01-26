import _Eris from 'eris';

export type OptionsObject = {
  operation: String;
  platform: String;
  keywords: String;
};

export const parseOptions = (optionsArray: any[]): OptionsObject => {
  return optionsArray.reduce((acc, curr) => {
    const data = curr as _Eris.InteractionDataOptionsWithValue;
    acc[data.name] = data.value;
    if (data.name === 'keywords') {
      acc[data.name] = sanitizeKeywords((data.value as String).split('|'));
    }
    return acc;
  }, {}) as OptionsObject;
};

export const sanitizeKeywords = (keywords: String[]): String[] => {
  return keywords.map(keyword => {
    let newKeyword = keyword.trim().toLowerCase();
    if (newKeyword.startsWith(`'`) || newKeyword.startsWith(`"`)) {
      newKeyword = newKeyword.slice(1);
    }
    if (newKeyword.endsWith(`'`) || newKeyword.endsWith(`"`)) {
      newKeyword = newKeyword.slice(0, -1);
    }
    return newKeyword;
  });
};
