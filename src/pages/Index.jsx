import { useState, useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import Editor from '../components/Editor';
import DiffViewer from '../components/DiffViewer';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Clock } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('timelineEntries');
    return savedEntries ? JSON.parse(savedEntries) : [
      { id: 1, timestamp: new Date().toISOString(), content: '' }
    ];
  });
  const [currentContent, setCurrentContent] = useState(() => {
    return localStorage.getItem('currentContent') || '';
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const timeoutRef = useRef(null);

  const createNewEntry = (newContent) => {
    const newEntries = [
      ...entries,
      { id: entries.length + 1, timestamp: new Date().toISOString(), content: newContent },
    ];
    setEntries(newEntries);
    localStorage.setItem('timelineEntries', JSON.stringify(newEntries));
  };

  useEffect(() => {
    localStorage.setItem('currentContent', currentContent);
  }, [currentContent]);

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
      <div className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold">VSCode Timeline Feature</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        </div>
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
