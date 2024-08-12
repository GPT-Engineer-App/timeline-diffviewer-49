import { useEffect, useState } from 'react';
import { diffLines, formatLines } from 'unidiff';

const DiffViewer = ({ oldContent, newContent }) => {
  const [diff, setDiff] = useState([]);

  useEffect(() => {
    const diffResult = diffLines(oldContent, newContent);
    setDiff(diffResult);
  }, [oldContent, newContent]);

  return (
    <div className="flex-1 p-4 bg-gray-50 overflow-y-auto h-full">
      <pre className="text-sm h-full">
        {diff.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'bg-green-200'
                : part.removed
                ? 'bg-red-200'
                : ''
            }
          >
            {part.value}
          </span>
        ))}
      </pre>
    </div>
  );
};

export default DiffViewer;
