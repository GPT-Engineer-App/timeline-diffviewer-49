import React, { useState, useEffect, useRef } from 'react';
import Timeline from '../components/Timeline';
import TimelineHeader from '../components/TimelineHeader';
import ContentArea from '../components/ContentArea';
import PreviousVersionArea from '../components/PreviousVersionArea';
import RewriteForm from '../components/RewriteForm';
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimelineEntries } from '../hooks/useTimelineEntries';
import { useContentSync } from '../hooks/useContentSync';
import { useAnthropicAPI } from '../hooks/useAnthropicAPI';

const Index = () => {
  const [currentContent, setCurrentContent] = useState('');
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);

  const { entries, createNewEntry, handleEntryDelete, handleClearHistory } = useTimelineEntries(currentContent);
  const { syncScroll } = useContentSync(textareaRef, overlayRef);
  const { isLoading, callAnthropicAPI } = useAnthropicAPI();

  useEffect(() => {
    const loadFromQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      const sharedData = params.get('sharedData');
      if (sharedData) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(sharedData));
          setCurrentContent(decodedData.currentContent);
          createNewEntry(decodedData.currentContent);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing shared data:', error);
        }
      } else {
        setCurrentContent(localStorage.getItem('currentContent') || '');
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
        description: "The share URL has been copied to your clipboard. This URL contains the entire editing history and current content.",
        duration: 5000,
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

  const handleContentChange = (newContent) => {
    setCurrentContent(newContent);
    createNewEntry(newContent);
  };

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newContent = await callAnthropicAPI(currentContent, inputValue);
      setCurrentContent(newContent);
      createNewEntry(newContent);
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      toast({
        title: "Error",
        description: "Failed to rewrite content. Please try again.",
        variant: "destructive",
      });
    } finally {
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