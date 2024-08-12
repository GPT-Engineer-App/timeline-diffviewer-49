import { Button } from "@/components/ui/button";

const Timeline = ({ entries, onEntrySelect }) => {
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
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
