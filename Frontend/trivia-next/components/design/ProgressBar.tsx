import React from 'react';
interface ProgressBarProps {
  current: number;
  total: number;
}
const ProgressBar = ({
  current,
  total
}: ProgressBarProps) => {
  const progress = current / total * 100;
  return <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>
          Question {current} of {total}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-3 w-full bg-indigo-800/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out" style={{
        width: `${progress}%`
      }} />
      </div>
    </div>;
};
export default ProgressBar;