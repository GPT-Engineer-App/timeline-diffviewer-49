import { useEffect, useState } from 'react';
import { diffWords } from 'diff';

const DiffViewer = ({ oldContent, newContent, showRemoved = false, showAdded = false }) => {
  const [diff, setDiff] = useState([]);

  useEffect(() => {
    const diffResult = diffWords(oldContent, newContent);
    setDiff(diffResult);
  }, [oldContent, newContent]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <pre className="text-sm whitespace-pre-wrap break-words p-2">
        {diff.map((part, index) => {
          if (part.added && showAdded) {
            return <span key={index} className="bg-green-200 bg-opacity-50">{part.value}</span>;
          }
          if (part.removed && showRemoved) {
            return <span key={index} className="bg-red-200 bg-opacity-50">{part.value}</span>;
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
