import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Timeline from '../components/Timeline';
import DiffViewer from '../components/DiffViewer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Menu, Share2, Trash2 } from "lucide-react";

const Index = () => {
  const [currentContent, setCurrentContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef(null);
  const { toast } = useToast();
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const loadFromQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      const sharedData = params.get('sharedData');
      if (sharedData) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(sharedData));
          setCurrentContent(decodedData.currentContent);
          setEntries(decodedData.entries);
          localStorage.setItem('currentContent', decodedData.currentContent);
          localStorage.setItem('timelineEntries', JSON.stringify(decodedData.entries));
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing shared data:', error);
        }
      } else {
        setCurrentContent(localStorage.getItem('currentContent') || '');
        const savedEntries = localStorage.getItem('timelineEntries');
        setEntries(savedEntries ? JSON.parse(savedEntries) : [
          { id: 1, timestamp: new Date().toISOString(), content: '' }
        ]);
      }
    };

    loadFromQueryParams();
  }, []);

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
    localStorage.setItem('currentContent', currentContent);
  }, [currentContent]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [syncScroll]);

  useLayoutEffect(() => {
    syncScroll();
  }, [currentContent, syncScroll]);

  const shareTimeline = () => {
    const dataToShare = {
      currentContent,
      entries
    };
    const encodedData = encodeURIComponent(JSON.stringify(dataToShare));
    const shareUrl = `${window.location.origin}${window.location.pathname}?sharedData=${encodedData}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Share URL Copied",
        description: "The share URL has been copied to your clipboard.",
      });
    });
  };

  const toggleTimeline = () => {
    setIsTimelineVisible(!isTimelineVisible);
  };

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
      { id: Date.now(), timestamp: new Date().toISOString(), content: newContent },
    ];
    setEntries(newEntries);
    localStorage.setItem('timelineEntries', JSON.stringify(newEntries));
  };

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

  const handleEntryDelete = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('timelineEntries', JSON.stringify(updatedEntries));
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry(null);
    }
    toast({
      title: "Entry Deleted",
      description: "The selected entry has been removed from the timeline.",
    });
  };

  const handleClearHistory = () => {
    setEntries([]);
    setSelectedEntry(null);
    localStorage.removeItem('timelineEntries');
    toast({
      title: "History Cleared",
      description: "All timeline entries have been removed.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const systemPrompt = `You must ONLY answer the new text, that will replace Current text.

Current text:
${currentContent}`;
      const userPrompt = inputValue;

      const response = await fetch('https://jyltskwmiwqthebrpzxt.supabase.co/functions/v1/llm', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHRza3dtaXdxdGhlYnJwenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxNTA2NjIsImV4cCI6MjAzNzcyNjY2Mn0.a1y6NavG5JxoGJCNrAckAKMvUDaXAmd2Ny0vMvz-7Ng',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
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
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} onEntryDelete={handleEntryDelete} />
        </div>
        <div className="hidden lg:block w-64 overflow-y-auto">
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} onEntryDelete={handleEntryDelete} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4">
            <Button onClick={toggleTimeline} variant="outline" size="icon" className="lg:hidden mb-4">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex overflow-hidden">
              {selectedEntry && (
                <div className="w-1/2 border-r pr-4 overflow-y-auto">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Previous Version</h3>
                    <Button onClick={() => handleRestore(selectedEntry.content)} variant="outline" size="sm">
                      Restore
                    </Button>
                  </div>
                  <div className="bg-white shadow-md rounded-md overflow-hidden">
                    <DiffViewer
                      oldContent={selectedEntry.content}
                      newContent={currentContent}
                      showRemoved={true}
                    />
                  </div>
                </div>
              )}
              <div className={`${selectedEntry ? 'w-1/2 pl-4' : 'w-full'} flex flex-col`}>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Current Version</h3>
                  <div className="flex space-x-2">
                    <Button onClick={shareTimeline} variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Timeline
                    </Button>
                    <Button onClick={handleClearHistory} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                </div>
                <div className="flex-1 relative bg-white shadow-md rounded-md overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full resize-none outline-none p-2 font-mono text-sm leading-6"
                    style={{
                      whiteSpace: 'pre-wrap',
                      overflowY: 'auto',
                      overflowX: 'auto',
                    }}
                  />
                  {selectedEntry && (
                    <div 
                      ref={overlayRef}
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{
                        overflowY: 'auto',
                        overflowX: 'auto',
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
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a prompt to rewrite the content..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Rewrite</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;