import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';

const Timeline = ({ entries, onEntrySelect }) => {
  const formatRelativeTime = (timestamp) => {
    const distance = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    if (distance.includes('less than a minute')) {
      return 'just now';
    }
    return distance;
  };

  return (
    <div className="w-full h-full bg-white lg:border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
        {entries.map((entry) => (
          <Button
            key={entry.id}
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => onEntrySelect(entry)}
          >
            <span className="truncate">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
