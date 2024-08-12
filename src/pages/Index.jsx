import { useState, useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import DiffViewer from '../components/DiffViewer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

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
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef(null);
  const { toast } = useToast();

  const handleRestore = (content) => {
    setCurrentContent(content);
    createNewEntry(content);
    toast({
      title: "Content Restored",
      description: "The selected version has been restored.",
    });
  };

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://jyltskwmiwqthebrpzxt.supabase.co/functions/v1/llm', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHRza3dtaXdxdGhlYnJwenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxNTA2NjIsImV4cCI6MjAzNzcyNjY2Mn0.a1y6NavG5JxoGJCNrAckAKMvUDaXAmd2Ny0vMvz-7Ng',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `${currentContent}\n\nUser: ${inputValue}` }
          ]
        }),
      });
      const data = await response.json();
      if (data.content && data.content[0] && data.content[0].text) {
        setCurrentContent(data.content[0].text);
        createNewEntry(data.content[0].text);
      }
    } catch (error) {
      console.error('Error calling LLM API:', error);
    }
    setInputValue('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            {selectedEntry ? (
              <DiffViewer
                oldContent={selectedEntry.content}
                newContent={currentContent}
                onRestore={handleRestore}
                onNewContentChange={handleContentChange}
              />
            ) : (
              <div className="p-4">
                <p>Select an entry from the timeline to view changes.</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
