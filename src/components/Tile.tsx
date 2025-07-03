import React from 'react';
import styled from '@emotion/styled';

export type TileStatus = 'correct' | 'present' | 'absent' | 'empty';

const getColor = (status: TileStatus) => {
  switch (status) {
    case 'correct': return '#6aaa64'; // green
    case 'present': return '#c9b458'; // yellow
    case 'absent': return '#3a3a3c'; // gray
    default: return '#121213'; // empty
  }
};

const TileContainer = styled.div`
  width: 60px;
  height: 60px;
  margin: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTile = styled.div<{ status: TileStatus }>`
  width: 100%;
  height: 100%;
  border: 2px solid #3a3a3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  background: ${({ status }) => getColor(status)};
  color: #fff;
  box-sizing: border-box;
  position: relative;
  border-radius: 6px;
  @media (max-width: 600px) {
    font-size: clamp(1rem, 6vw, 2.5rem);
  }
`;

type TileProps = {
  letter: string;
  status: TileStatus;
};

const Tile: React.FC<TileProps> = ({ letter, status }) => (
  <TileContainer className="TileContainer">
    <StyledTile className="StyledTile" status={status}>
      {letter}
    </StyledTile>
  </TileContainer>
);

export default Tile; 