import React from 'react';
import { Button } from "@/components/ui/button";
import DiffViewer from './DiffViewer';

const PreviousVersionArea = ({ selectedEntry, currentContent, onRestore }) => {
  if (!selectedEntry) return null;

  return (
    <div className="w-1/2 border-r pr-4 overflow-y-auto flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Previous Version</h3>
        <Button onClick={() => onRestore(selectedEntry.content)} variant="outline" size="sm">
          Restore
        </Button>
      </div>
      <div className="flex-1 bg-white shadow-md rounded-md overflow-hidden">
        <DiffViewer
          oldContent={selectedEntry.content}
          newContent={currentContent}
          showRemoved={true}
        />
      </div>
    </div>
  );
};

export default PreviousVersionArea;