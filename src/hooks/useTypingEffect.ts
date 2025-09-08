import { useState, useEffect } from 'react';

export const useTypingEffect = (text: string, speed: number = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setDisplayedText('');
        setCurrentIndex(0);
      }, 2000);

      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex, text, speed]);

  return displayedText;
};