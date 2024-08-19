import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const TimelineHeader = ({ onClearHistory }) => {
  return (
    <div className="p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Timeline</h2>
      <Button onClick={onClearHistory} variant="outline" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
};

export default TimelineHeader;