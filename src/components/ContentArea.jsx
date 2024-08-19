import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import DiffViewer from './DiffViewer';

const ContentArea = ({ selectedEntry, currentContent, onContentChange, onShare, textareaRef, overlayRef }) => {
  return (
    <div className={`${selectedEntry ? 'w-1/2 pl-4' : 'w-full'} flex flex-col`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Version</h3>
        <Button onClick={onShare} variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      <div className="flex-1 relative bg-white shadow-md rounded-md overflow-hidden">
        <textarea
          ref={textareaRef}
          value={currentContent}
          onChange={(e) => onContentChange(e.target.value)}
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
  );
};

export default ContentArea;