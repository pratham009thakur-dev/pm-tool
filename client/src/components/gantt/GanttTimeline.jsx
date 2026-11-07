import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

const STATUS_COLORS = {
  Backlog: 'bg-slate-400',
  'To Do': 'bg-indigo-500',
  'In Progress': 'bg-sky-500',
  'In Review': 'bg-amber-500',
  Done: 'bg-emerald-500',
};

const GanttTimeline = ({ tasks = [], project }) => {
  const [scale, setScale] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [timelineStart, setTimelineStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d;
  });

  const numUnits = scale === 'daily' ? 24 : scale === 'weekly' ? 12 : 6;

  const getTimelineUnits = () => {
    const units = [];
    for (let i = 0; i < numUnits; i++) {
      const d = new Date(timelineStart);
      if (scale === 'daily') {
        d.setDate(d.getDate() + i);
        units.push({
          label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          date: new Date(d),
        });
      } else if (scale === 'weekly') {
        d.setDate(d.getDate() + i * 7);
        units.push({
          label: `Wk of ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
          date: new Date(d),
        });
      } else {
        d.setMonth(d.getMonth() + i);
        units.push({
          label: d.toLocaleDateString([], { month: 'short', year: '2-digit' }),
          date: new Date(d),
        });
      }
    }
    return units;
  };

  const units = getTimelineUnits();
  const totalDays = scale === 'daily' ? numUnits : scale === 'weekly' ? numUnits * 7 : numUnits * 30;

  const navigateTimeline = (direction) => {
    const offset = scale === 'daily' ? 7 : scale === 'weekly' ? 21 : 60;
    const nextStart = new Date(timelineStart);
    nextStart.setDate(nextStart.getDate() + (direction === 'forward' ? offset : -offset));
    setTimelineStart(nextStart);
  };

  // Computes the left percentage and width percentage along the timeline axis
  const calculateBarCoordinates = (start, due) => {
    const startTime = new Date(start).getTime();
    const dueTime = new Date(due).getTime();
    const originTime = units[0].date.getTime();
    const horizonTime = units[units.length - 1].date.getTime();
    const totalHorizonDuration = horizonTime - originTime;

    if (dueTime < originTime || startTime > horizonTime) {
      return null;
    }

    const clampedStart = Math.max(startTime, originTime);
    const clampedDue = Math.min(dueTime, horizonTime);

    const left = ((clampedStart - originTime) / totalHorizonDuration) * 100;
    const width = Math.max(((clampedDue - clampedStart) / totalHorizonDuration) * 100, 2);

    return { left: Math.max(0, left), width: Math.min(100 - left, width) };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateTimeline('backward')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-2">
            Horizon: {units[0]?.label} – {units[units.length - 1]?.label}
          </span>
          <button
            onClick={() => navigateTimeline('forward')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {['daily', 'weekly', 'monthly'].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                scale === s ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Gantt Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Axis */}
          <div className="grid grid-cols-12 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600">
            <div className="col-span-4 p-3 border-r border-slate-200 flex items-center">
              Task Specifications
            </div>
            <div className="col-span-8 flex divide-x divide-slate-200 overflow-hidden">
              {units.map((u, i) => (
                <div key={i} className="flex-1 p-2 text-center text-[10px] uppercase tracking-wider truncate">
                  {u.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No project tasks scheduled.</div>
            ) : (
              tasks.map((task) => {
                const coords = calculateBarCoordinates(task.startDate || task.createdAt, task.dueDate);
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

                return (
                  <div key={task._id} className="grid grid-cols-12 hover:bg-slate-50/50 transition items-center">
                    {/* Left Column: Task Name, Status & Assignee */}
                    <div className="col-span-4 p-3 border-r border-slate-100 flex items-center justify-between pr-4">
                      <div className="truncate mr-2">
                        <span className="text-xs font-bold text-slate-800 truncate block">{task.title}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-bold text-rose-600 flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={task.status}>{task.status}</Badge>
                    </div>

                    {/* Right Timeline Canvas */}
                    <div className="col-span-8 h-12 relative flex items-center px-1">
                      {coords ? (
                        <div
                          className={`absolute h-7 rounded-lg shadow-xs text-white text-[11px] font-semibold px-2 flex items-center truncate ${
                            STATUS_COLORS[task.status] || 'bg-indigo-600'
                          }`}
                          style={{
                            left: `${coords.left}%`,
                            width: `${coords.width}%`,
                          }}
                          title={`${task.title} (${task.status})`}
                        >
                          <span className="truncate">{task.title}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic pl-4">Out of horizon bounds</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttTimeline;