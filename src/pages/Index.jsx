import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Timeline from '../components/Timeline';
import TimelineHeader from '../components/TimelineHeader';
import ContentArea from '../components/ContentArea';
import PreviousVersionArea from '../components/PreviousVersionArea';
import RewriteForm from '../components/RewriteForm';
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [currentContent, setCurrentContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    if (entries.length === 0) {
      createNewEntry(newContent);
      return;
    }

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
    setIsLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to rewrite content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={sidebarRef}
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${isTimelineVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
        >
          <TimelineHeader onClearHistory={handleClearHistory} />
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} onEntryDelete={handleEntryDelete} />
        </div>
        <div className="hidden lg:flex lg:flex-col w-64 overflow-y-auto">
          <TimelineHeader onClearHistory={handleClearHistory} />
          <Timeline entries={entries} onEntrySelect={handleEntrySelect} onEntryDelete={handleEntryDelete} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-1 flex flex-col">
            <Button onClick={toggleTimeline} variant="outline" size="icon" className="lg:hidden mb-4">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex overflow-hidden">
              <PreviousVersionArea
                selectedEntry={selectedEntry}
                currentContent={currentContent}
                onRestore={handleRestore}
              />
              <ContentArea
                selectedEntry={selectedEntry}
                currentContent={currentContent}
                onContentChange={handleContentChange}
                onShare={shareTimeline}
                textareaRef={textareaRef}
                overlayRef={overlayRef}
              />
            </div>
          </div>
          <RewriteForm
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;