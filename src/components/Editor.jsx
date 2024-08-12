import { Textarea } from "@/components/ui/textarea";

const Editor = ({ content, onChange }) => {
  return (
    <div className="flex-1 p-4">
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full resize-none"
        placeholder="Type your content here..."
      />
    </div>
  );
};

export default Editor;
