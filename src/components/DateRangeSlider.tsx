import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangeSliderProps {
  minDate: Date;
  maxDate: Date;
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

export function DateRangeSlider({
  minDate,
  maxDate,
  startDate,
  endDate,
  onChange,
}: DateRangeSliderProps) {
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();
  const totalRange = maxTime - minTime;

  const [startValue, setStartValue] = useState(
    ((startDate.getTime() - minTime) / totalRange) * 100
  );
  const [endValue, setEndValue] = useState(
    ((endDate.getTime() - minTime) / totalRange) * 100
  );

  useEffect(() => {
    setStartValue(((startDate.getTime() - minTime) / totalRange) * 100);
    setEndValue(((endDate.getTime() - minTime) / totalRange) * 100);
  }, [startDate, endDate, minTime, totalRange]);

  const handleStartChange = (value: number) => {
    const newValue = Math.min(value, endValue - 1);
    setStartValue(newValue);
    const newDate = new Date(minTime + (newValue / 100) * totalRange);
    onChange(newDate, endDate);
  };

  const handleEndChange = (value: number) => {
    const newValue = Math.max(value, startValue + 1);
    setEndValue(newValue);
    const newDate = new Date(minTime + (newValue / 100) * totalRange);
    onChange(startDate, newDate);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Date Range:
          </h3>
          <div className="flex-1 flex items-center justify-center gap-3 text-base">
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {format(startDate, 'MMM d, yyyy')}
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Dual range slider */}
        <div className="relative h-2">
          {/* Track */}
          <div className="absolute w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
          
          {/* Active range */}
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{
              left: `${startValue}%`,
              width: `${endValue - startValue}%`,
            }}
          />

          {/* Start slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={startValue}
            onChange={(e) => handleStartChange(parseFloat(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
            style={{ zIndex: startValue > 50 ? 5 : 3 }}
          />

          {/* End slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={endValue}
            onChange={(e) => handleEndChange(parseFloat(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
            style={{ zIndex: endValue > 50 ? 5 : 3 }}
          />
        </div>
      </div>
    </div>
  );
}
