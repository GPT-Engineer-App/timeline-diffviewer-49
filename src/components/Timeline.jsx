import { Button } from "@/components/ui/button";
import { differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns';
import { X } from 'lucide-react';

const Timeline = ({ entries, onEntrySelect, onEntryDelete }) => {
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const secondsDiff = differenceInSeconds(now, date);
    const minutesDiff = differenceInMinutes(now, date);
    const hoursDiff = differenceInHours(now, date);

    if (secondsDiff < 60) {
      return `${secondsDiff}s ago`;
    } else if (minutesDiff < 60) {
      return `${minutesDiff}m ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-full h-full bg-white lg:border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
        {entries.slice().reverse().map((entry) => (
          <div key={entry.id} className="flex items-center">
            <Button
              variant="ghost"
              className="flex-grow justify-start text-left"
              onClick={() => onEntrySelect(entry)}
            >
              <span className="truncate">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => onEntryDelete(entry.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
