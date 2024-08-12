import { useState, useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import DiffViewer from '../components/DiffViewer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";

const Index = () => {
  const [currentContent, setCurrentContent] = useState(() => {
    return localStorage.getItem('currentContent') || '';
  });

  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('timelineEntries');
    return savedEntries ? JSON.parse(savedEntries) : [
      { id: 1, timestamp: new Date().toISOString(), content: currentContent }
    ];
  });

  const [isTimelineVisible, setIsTimelineVisible] = useState(false);

  const toggleTimeline = () => {
    setIsTimelineVisible(!isTimelineVisible);
  };

  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isTimelineVisible) {
        setIsTimelineVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimelineVisible]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;

    if (textarea && overlay) {
      const handleScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
      };

      textarea.addEventListener('scroll', handleScroll);

      return () => {
        textarea.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
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

  const handleSubmit = async (e, isRewrite = false) => {
    e.preventDefault();
    try {
      const prompt = isRewrite
        ? `Rewrite the following text:\n\n${currentContent}`
        : `${currentContent}\n\nUser: ${inputValue}`;

      const response = await fetch('https://jyltskwmiwqthebrpzxt.supabase.co/functions/v1/llm', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHRza3dtaXdxdGhlYnJwenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxNTA2NjIsImV4cCI6MjAzNzcyNjY2Mn0.a1y6NavG5JxoGJCNrAckAKMvUDaXAmd2Ny0vMvz-7Ng',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: prompt }
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
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={sidebarRef}
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${isTimelineVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
        >
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        </div>
        <div className="hidden lg:block w-64 overflow-y-auto">
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden p-4">
            <Button onClick={toggleTimeline} variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            {selectedEntry && (
              <div className="w-1/2 border-r p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Previous Version</h3>
                <div className="bg-white shadow-md rounded-md overflow-hidden">
                  <DiffViewer
                    oldContent={selectedEntry.content}
                    newContent={currentContent}
                    showRemoved={true}
                  />
                </div>
              </div>
            )}
            <div className={`${selectedEntry ? 'w-1/2' : 'w-full'} p-4 flex flex-col`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Current Version</h3>
                {selectedEntry && (
                  <Button onClick={() => handleRestore(selectedEntry.content)} variant="outline" size="sm">
                    Restore
                  </Button>
                )}
              </div>
              <div className="flex-1 relative bg-white shadow-md rounded-md overflow-hidden">
                <div className="relative w-full h-full">
                  <textarea
                    ref={textareaRef}
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full resize-none outline-none p-2 font-mono text-sm leading-6"
                    style={{
                      whiteSpace: 'pre-wrap',
                      overflowY: 'scroll',
                      overflowX: 'scroll',
                    }}
                  />
                  {selectedEntry && (
                    <div 
                      ref={overlayRef}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        overflowY: 'hidden',
                        overflowX: 'hidden',
                      }}
                    >
                    <DiffViewer
                      oldContent={selectedEntry.content}
                      newContent={currentContent}
                      showAdded={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter your question or prompt..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Ask</Button>
              <Button type="button" onClick={(e) => handleSubmit(e, true)}>Rewrite</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
