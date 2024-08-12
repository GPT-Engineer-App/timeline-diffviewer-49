import { useState, useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import Editor from '../components/Editor';
import DiffViewer from '../components/DiffViewer';

const Index = () => {
  const [entries, setEntries] = useState([
    { id: 1, timestamp: new Date().toISOString(), content: 'Initial content' },
  ]);
  const [currentContent, setCurrentContent] = useState('Initial content');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const timeoutRef = useRef(null);

  const createNewEntry = (newContent) => {
    setEntries([
      ...entries,
      { id: entries.length + 1, timestamp: new Date().toISOString(), content: newContent },
    ]);
  };

  const handleContentChange = (newContent) => {
    setCurrentContent(newContent);

    const lastEntry = entries[entries.length - 1];
    const charDiff = Math.abs(newContent.length - lastEntry.content.length);

    if (charDiff > 30) {
      createNewEntry(newContent);
    } else {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        if (newContent !== lastEntry.content) {
          createNewEntry(newContent);
        }
      }, 1000);
    }
  };

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <h1 className="text-3xl font-bold p-4">VSCode Timeline Feature</h1>
      <div className="flex flex-1">
        <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        <div className="flex-1 flex">
          {selectedEntry && (
            <DiffViewer
              oldContent={selectedEntry.content}
              newContent={currentContent}
            />
          )}
          <Editor content={currentContent} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  );
};

export default Index;
