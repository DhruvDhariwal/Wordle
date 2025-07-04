import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Global, css } from '@emotion/react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Popup from './components/Popup';
import WORD_LIST from './wordList';
import { TileStatus } from './components/Tile';

const globalStyles = css`
  body {
    margin: 0;
    font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
    background: #121213;
    color: #fff;
    min-height: 100vh;
  }
`;

const MAX_ROWS = 6;
const WORD_LENGTH = 5;

// Official Wordle coloring logic
function getStatuses(guess: string, solution: string): TileStatus[] {
  const result: TileStatus[] = Array(WORD_LENGTH).fill('absent');
  const solutionArr = solution.split('');
  const guessArr = guess.split('');
  const solutionLetterCount: Record<string, number> = {};
  // Count letters in solution
  for (let i = 0; i < WORD_LENGTH; i++) {
    solutionLetterCount[solutionArr[i]] = (solutionLetterCount[solutionArr[i]] || 0) + 1;
  }
  // First pass: correct
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === solutionArr[i]) {
      result[i] = 'correct';
      solutionLetterCount[guessArr[i]]--;
    }
  }
  // Second pass: present
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    if (solutionArr.includes(guessArr[i]) && solutionLetterCount[guessArr[i]] > 0) {
      result[i] = 'present';
      solutionLetterCount[guessArr[i]]--;
    }
  }
  return result;
}

function getKeyStatuses(guesses: string[], statuses: TileStatus[][]): Record<string, TileStatus> {
  const keyStatus: Record<string, TileStatus> = {};
  guesses.forEach((guess, i) => {
    guess.split('').forEach((letter, j) => {
      const status = statuses[i][j];
      if (status === 'correct' || (status === 'present' && keyStatus[letter] !== 'correct') || (status === 'absent' && !keyStatus[letter])) {
        keyStatus[letter] = status;
      }
    });
  });
  return keyStatus;
}

const App: React.FC = () => {
  const [solution, setSolution] = useState<string>('');
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [statuses, setStatuses] = useState<TileStatus[][]>([]);
  const [current, setCurrent] = useState<string>('');
  const [row, setRow] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [popup, setPopup] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [wordNumber, setWordNumber] = useState<number>(1);
  const [sidebarInput, setSidebarInput] = useState<string>('1');
  const [sidebarError, setSidebarError] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [completedWords, setCompletedWords] = useState<{num: number, word: string}[]>(() => {
    const saved = localStorage.getItem('completedWords');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCompletedWords, setShowCompletedWords] = useState<boolean>(true);

  // Refs for always-up-to-date state in keyboard handler
  const guessesRef = useRef(guesses);
  const statusesRef = useRef(statuses);
  const currentRef = useRef(current);
  const rowRef = useRef(row);
  const gameStatusRef = useRef(gameStatus);
  const solutionRef = useRef(solution);

  useEffect(() => { guessesRef.current = guesses; }, [guesses]);
  useEffect(() => { statusesRef.current = statuses; }, [statuses]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { rowRef.current = row; }, [row]);
  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { solutionRef.current = solution; }, [solution]);

  // Set solution based on word number and reset all state
  const setSolutionByNumber = useCallback((num: number) => {
    if (num < 1 || num > WORD_LIST.length) {
      setSidebarError(`Word number must be between 1 and ${WORD_LIST.length}`);
      return;
    }
    setSolution(WORD_LIST[num - 1].toLowerCase());
    setWordNumber(num);
    setGuesses([]);
    setStatuses([]);
    setCurrent('');
    setRow(0);
    setGameStatus('playing');
    setPopup({ message: '', show: false });
    setSidebarError('');
  }, []);

  // Helper to get query param
  function getQueryParam(name: string) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // On mount, set initial solution (from ?word= param if present)
  useEffect(() => {
    const param = getQueryParam('word');
    const num = param ? parseInt(param, 10) : 1;
    if (num >= 1 && num <= WORD_LIST.length) {
      setSidebarInput(num.toString());
      setSolutionByNumber(num);
    } else {
      setSolutionByNumber(1);
    }
  }, [setSolutionByNumber]);

  // Handle sidebar Play button
  const handleSidebarPlay = () => {
    const num = parseInt(sidebarInput, 10);
    if (isNaN(num)) {
      setSidebarError('Please enter a valid number');
      return;
    }
    setSolutionByNumber(num);
  };

  // Handle Play Again (always reset state, even if word number is unchanged)
  const handlePlayAgain = () => {
    setSolutionByNumber(wordNumber);
  };

  // Handle Next Word (increment word number and start new game)
  const handleNextWord = () => {
    if (wordNumber < WORD_LIST.length) {
      setSolutionByNumber(wordNumber + 1);
    }
  };

  // Unified key handler (for both on-screen and physical keyboard)
  const handleKey = useCallback((key: string) => {
    if (gameStatusRef.current !== 'playing') return;
    if (key === 'enter') {
      if (currentRef.current.length !== WORD_LENGTH) {
        setPopup({ message: 'Not enough letters', show: true });
        return;
      }
      if (!WORD_LIST.includes(currentRef.current.toLowerCase())) {
        setPopup({ message: 'Not in word list', show: true });
        return;
      }
      const guessStatuses = getStatuses(currentRef.current, solutionRef.current);
      setGuesses(prev => [...prev, currentRef.current.split('')]);
      setStatuses(prev => [...prev, guessStatuses]);
      setCurrent('');
      setRow(prev => prev + 1);
      if (currentRef.current === solutionRef.current) {
        setGameStatus('won');
        setPopup({ message: 'Great job!', show: true });
      } else if (rowRef.current + 1 === MAX_ROWS) {
        setGameStatus('lost');
        setPopup({ message: `The word was ${solutionRef.current.toUpperCase()}`, show: true });
      }
      return;
    }
    if (key === 'back') {
      setCurrent((c) => c.slice(0, -1));
      return;
    }
    if (/^[a-z]$/.test(key) && currentRef.current.length < WORD_LENGTH) {
      setCurrent((c) => c + key);
    }
  }, []);

  // On-screen keyboard uses the unified handler
  const onKey = handleKey;

  // Physical keyboard event listener uses the unified handler
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (gameStatusRef.current !== 'playing') return;
      if (e.key === 'Enter') handleKey('enter');
      else if (e.key === 'Backspace') handleKey('back');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [handleKey]);

  // Dismiss popup after a short time
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup((p) => ({ ...p, show: false })), 1500);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  // Prepare board data: always 6 rows
  let boardGuesses: string[][] = [];
  let boardStatuses: TileStatus[][] = [];
  for (let i = 0; i < MAX_ROWS; i++) {
    if (i < guesses.length) {
      boardGuesses.push(guesses[i]);
      boardStatuses.push(statuses[i]);
    } else if (i === guesses.length && gameStatus === 'playing') {
      boardGuesses.push(current.split('').concat(Array(WORD_LENGTH - current.length).fill('')));
      boardStatuses.push(Array(WORD_LENGTH).fill('empty'));
    } else {
      boardGuesses.push(Array(WORD_LENGTH).fill(''));
      boardStatuses.push(Array(WORD_LENGTH).fill('empty'));
    }
  }

  const keyStatuses = getKeyStatuses(guesses.map((g) => g.join('')), statuses);

  // When a word is completed, add it to completedWords and localStorage
  useEffect(() => {
    if (gameStatus === 'won') {
      setCompletedWords(prev => {
        if (prev.some(w => w.num === wordNumber)) return prev;
        const updated = [...prev, { num: wordNumber, word: solution }];
        localStorage.setItem('completedWords', JSON.stringify(updated));
        return updated;
      });
    }
  }, [gameStatus, wordNumber, solution]);

  // Copy shareable link for current word number
  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?word=${wordNumber}`;
    navigator.clipboard.writeText(url);
    setPopup({ message: 'Link copied!', show: true });
  };

  // Overlay for Play Again / Next Word popup
  const showEndGamePopup = gameStatus === 'won' || gameStatus === 'lost';

  return (
    <>
      <Global styles={globalStyles} />
      {/* Top bar with menu button */}
      <div style={{ width: '100%', background: '#18181b', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', borderBottom: '2px solid #222', position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', marginLeft: 16 }}
          title={dropdownOpen ? 'Close menu' : 'Open menu'}
        >
          ☰
        </button>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginLeft: 16 }}>Wordle - made by Dhruv</span>
      </div>
      {/* Dropdown panel */}
      {dropdownOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100vw',
          background: '#18181b',
          color: '#fff',
          zIndex: 100,
          padding: '24px 12px',
          borderBottom: '2px solid #222',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setDropdownOpen(false)}
            style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}
            title="Close menu"
          >
            ×
          </button>
          <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Word Number</h2>
          <input
            type="number"
            min={1}
            max={WORD_LIST.length}
            value={sidebarInput}
            onChange={e => setSidebarInput(e.target.value)}
            style={{ width: '100%', fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #333', marginBottom: 8, background: '#222', color: '#fff' }}
          />
          <button
            onClick={handleSidebarPlay}
            style={{ width: '100%', padding: 10, fontSize: 18, borderRadius: 4, background: '#538d4e', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 8 }}
          >
            Play
          </button>
          <button
            onClick={handleCopyLink}
            style={{ width: '100%', padding: 8, fontSize: 15, borderRadius: 4, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 8 }}
          >
            Copy Link
          </button>
          <div style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>
            Current: <b>#{wordNumber}</b>
          </div>
          {sidebarError && <div style={{ color: '#ff6666', fontSize: 14 }}>{sidebarError}</div>}
          {/* Completed words list */}
          <div style={{ marginTop: 24, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, flex: 1 }}>Completed Words</div>
              <button
                onClick={() => setShowCompletedWords(v => !v)}
                style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontSize: 13, cursor: 'pointer' }}
                title={showCompletedWords ? 'Hide words' : 'Show words'}
              >
                {showCompletedWords ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', background: '#222', borderRadius: 6, padding: 8, border: '1px solid #333' }}>
              {completedWords.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13 }}>No words completed yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {completedWords
                    .sort((a, b) => a.num - b.num)
                    .map(({ num, word }) => (
                      <li key={num} style={{ color: '#b5e48c', fontSize: 14, marginBottom: 4 }}>
                        #{num}: <span style={{ color: '#fff', fontWeight: 500 }}>
                          {showCompletedWords ? word.toUpperCase() : '*****'}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
        {/* Main game area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32 }}>
          <div
            className={window.innerWidth < 600 ? 'board-mobile-spacing' : ''}
            style={{
              width: window.innerWidth < 600 ? '96vw' : 420,
              maxWidth: 420,
              margin: '0 auto',
              height: 404,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}>
            <GameBoard guesses={boardGuesses} statuses={boardStatuses} maxRows={MAX_ROWS} />
          </div>
          <Keyboard onKey={onKey} keyStatuses={keyStatuses} />
          <Popup message={popup.message} show={popup.show} />
          {showEndGamePopup && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#222',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              padding: '32px 24px',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 220,
              maxWidth: '90vw',
            }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
                <button
                  onClick={handlePlayAgain}
                  style={{ padding: '12px 32px', fontSize: 18, fontWeight: 600, borderRadius: 8, background: '#538d4e', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Play Again
                </button>
                <button
                  onClick={handleNextWord}
                  style={{ padding: '12px 32px', fontSize: 18, fontWeight: 600, borderRadius: 8, background: '#3a7bd5', color: '#fff', border: 'none', cursor: wordNumber >= WORD_LIST.length ? 'not-allowed' : 'pointer', opacity: wordNumber >= WORD_LIST.length ? 0.5 : 1 }}
                  disabled={wordNumber >= WORD_LIST.length}
                >
                  Next Word
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
