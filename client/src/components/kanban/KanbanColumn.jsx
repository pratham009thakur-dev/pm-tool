import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ columnId, title, tasks = [], onCardClick, onQuickAdd }) => {
  return (
    <div className="w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 flex flex-col max-h-[calc(100vh-14rem)] border border-slate-200/60">
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{title}</h3>
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-600">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onQuickAdd(title)}
          className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Droppable droppableId={title}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 transition-colors rounded-xl ${
              snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task._id} task={task} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;