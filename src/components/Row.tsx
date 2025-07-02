import React from 'react';
import Tile, { TileStatus } from './Tile';

interface RowProps {
  letters: string[];
  statuses: TileStatus[];
}

const Row: React.FC<RowProps> = ({ letters, statuses }) => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    {letters.map((letter, i) => (
      <Tile
        key={i}
        letter={letter}
        status={statuses[i]}
      />
    ))}
  </div>
);

export default Row; 