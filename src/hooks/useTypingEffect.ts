import { useState, useEffect, useCallback, useMemo } from 'react';

export const useTypingEffect = (text: string, speed: number = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Memoize the text to prevent unnecessary re-renders
  const memoizedText = useMemo(() => text, [text]);

  const resetTyping = useCallback(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    if (currentIndex < memoizedText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + memoizedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Pause typing and reset after a delay
      setIsTyping(false);
      const resetTimer = setTimeout(() => {
        resetTyping();
      }, 2000);

      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex, memoizedText, speed, isTyping, resetTyping]);

  return displayedText || 'Search';
};