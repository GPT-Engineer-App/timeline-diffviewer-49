import { useEffect, useState } from 'react';
import { diffWords } from 'diff';

const DiffViewer = ({ oldContent, newContent, showRemoved = false, showAdded = false, onContentChange }) => {
  const [diff, setDiff] = useState([]);

  useEffect(() => {
    const diffResult = diffWords(oldContent, newContent);
    setDiff(diffResult);
  }, [oldContent, newContent]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <pre className="text-sm whitespace-pre-wrap break-words">
        {diff.map((part, index) => {
          if (part.added && showAdded) {
            return <span key={index} className="text-green-600">{part.value}</span>;
          }
          if (part.removed && showRemoved) {
            return <span key={index} className="text-red-600">{part.value}</span>;
          }
          if (!part.added && !part.removed) {
            return <span key={index}>{part.value}</span>;
          }
          return null;
        })}
      </pre>
    </div>
  );
};

export default DiffViewer;
