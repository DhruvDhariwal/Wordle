import React from 'react';
import styled from '@emotion/styled';
import { TileStatus } from './Tile';

const KEYS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'back'],
];

const getKeyColor = (status?: TileStatus) => {
  switch (status) {
    case 'correct': return '#6aaa64';
    case 'present': return '#c9b458';
    case 'absent': return '#3a3a3c';
    default: return '#818384';
  }
};

const KeyButton = styled.button<{ status?: TileStatus }>`
  background: ${({ status }) => getKeyColor(status)};
  color: #fff;
  border: none;
  border-radius: 4px;
  margin: 4px;
  padding: 0 14px;
  height: 48px;
  min-width: 36px;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
`;

interface KeyboardProps {
  onKey: (key: string) => void;
  keyStatuses: Record<string, TileStatus | undefined>;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKey, keyStatuses }) => (
  <div className="KeyboardContainer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16 }}>
    {KEYS.map((row, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
        {row.map((key) => (
          <KeyButton
            className={key === 'enter' || key === 'back' ? 'KeyButton special-key' : 'KeyButton'}
            key={key}
            status={keyStatuses[key]}
            onClick={() => onKey(key)}
            style={key === 'enter' || key === 'back' ? { minWidth: 60 } : {}}
          >
            {key === 'back' ? '⌫' : key}
          </KeyButton>
        ))}
      </div>
    ))}
  </div>
);

export default Keyboard; 