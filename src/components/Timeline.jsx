import { Button } from "@/components/ui/button";

const Timeline = ({ entries, onEntrySelect }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <Button
            key={entry.id}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onEntrySelect(entry)}
          >
            {new Date(entry.timestamp).toLocaleString()}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
