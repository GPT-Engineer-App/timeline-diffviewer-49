import { useState, useEffect } from 'react';

export const useTimelineEntries = (currentContent) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('timelineEntries');
    setEntries(savedEntries ? JSON.parse(savedEntries) : [
      { id: 1, timestamp: new Date().toISOString(), content: currentContent }
    ]);
  }, []);

  const createNewEntry = (newContent) => {
    if (entries.length === 0 || newContent !== entries[entries.length - 1].content) {
      const newEntries = [
        ...entries,
        { id: Date.now(), timestamp: new Date().toISOString(), content: newContent },
      ];
      setEntries(newEntries);
      localStorage.setItem('timelineEntries', JSON.stringify(newEntries));
    }
  };

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