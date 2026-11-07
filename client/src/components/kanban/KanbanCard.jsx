import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import Badge from '../common/Badge';
import { Calendar, AlertCircle } from 'lucide-react';

const KanbanCard = ({ task, index, onClick }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-xl p-4 border transition cursor-pointer select-none mb-3 ${
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-indigo-500 border-indigo-500 rotate-1'
              : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant={task.priority}>{task.priority}</Badge>
            {isOverdue && (
              <span className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                <AlertCircle className="w-3 h-3 mr-1" /> Overdue
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{task.title}</h4>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {task.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span className="text-[11px]">{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="flex items-center">
              {task.assignee ? (
                <div
                  title={task.assignee.name}
                  className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs ring-1 ring-white"
                >
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Unassigned</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;