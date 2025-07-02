import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';

const PopupContainer = styled(motion.div)`
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #262626;
  color: #fff;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  text-align: center;
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