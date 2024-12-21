import { useState, useEffect, useCallback } from 'react';
import { throttle } from 'lodash';

export const useTimelineEntries = (currentContent) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('timelineEntries');
    setEntries(savedEntries ? JSON.parse(savedEntries) : [
      { id: 1, timestamp: new Date().toISOString(), content: currentContent }
    ]);
  }, []);

  // Throttle the creation of new entries to once every 2 seconds
  const createNewEntry = useCallback(
    throttle((newContent) => {
      if (entries.length === 0 || newContent !== entries[entries.length - 1].content) {
        const newEntries = [
          ...entries,
          { id: Date.now(), timestamp: new Date().toISOString(), content: newContent },
        ];
        setEntries(newEntries);
        localStorage.setItem('timelineEntries', JSON.stringify(newEntries));
      }
    }, 2000),
    [entries]
  );

  const handleEntryDelete = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('timelineEntries', JSON.stringify(updatedEntries));
  };

  const handleClearHistory = () => {
    setEntries([]);
    localStorage.removeItem('timelineEntries');
  };

  return { entries, createNewEntry, handleEntryDelete, handleClearHistory };
};