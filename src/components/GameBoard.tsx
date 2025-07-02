import React from 'react';
import Row from './Row';
import { TileStatus } from './Tile';

interface GameBoardProps {
  guesses: string[][];
  statuses: TileStatus[][];
  maxRows?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ guesses, statuses, maxRows = 6 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: maxRows }).map((_, i) => (
        <Row
          key={i}
          letters={guesses[i] || Array(5).fill('')}
          statuses={statuses[i] || Array(5).fill('empty')}
        />
      ))}
    </div>
  );
};

export default GameBoard; 