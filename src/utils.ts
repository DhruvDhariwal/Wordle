import WORD_LIST from './wordList';

export function getRandomWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export function isValidWord(word: string): boolean {
  return WORD_LIST.includes(word.toLowerCase());
} 