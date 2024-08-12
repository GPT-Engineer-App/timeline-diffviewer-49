import { useState } from 'react';
import Timeline from '../components/Timeline';
import Editor from '../components/Editor';
import DiffViewer from '../components/DiffViewer';

const Index = () => {
  const [entries, setEntries] = useState([
    { id: 1, timestamp: new Date().toISOString(), content: 'Initial content' },
  ]);
  const [currentContent, setCurrentContent] = useState('Initial content');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleContentChange = (newContent) => {
    setCurrentContent(newContent);
    setEntries([
      ...entries,
      { id: entries.length + 1, timestamp: new Date().toISOString(), content: newContent },
    ]);
  };

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <h1 className="text-3xl font-bold p-4">VSCode Timeline Feature</h1>
      <div className="flex flex-1">
        <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        <div className="flex-1 flex">
          <Editor content={currentContent} onChange={handleContentChange} />
          {selectedEntry && (
            <DiffViewer
              oldContent={selectedEntry.content}
              newContent={currentContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
