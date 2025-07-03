import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';

const PopupContainer = styled(motion.div)`
  position: fixed;
  top: 20%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(-50%);
  background: #262626;
  color: #fff;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  text-align: center;
  box-sizing: border-box;
  max-width: 200px;
  @media (max-width: 600px) {
    max-width: 54vw;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    transform: translateY(-50%);
    padding: 8px 6vw;
    font-size: 1rem;
  }
`;

interface PopupProps {
  message: string;
  show: boolean;
  duration?: number;
}

const Popup: React.FC<PopupProps> = ({ message, show, duration = 1500 }) => (
  <AnimatePresence>
    {show && (
      <PopupContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </PopupContainer>
    )}
  </AnimatePresence>
);

export default Popup; 