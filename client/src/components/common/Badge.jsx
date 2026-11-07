import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    Planning: 'bg-purple-50 text-purple-700 border-purple-200',
    'In Progress': 'bg-sky-50 text-sky-700 border-sky-200',
    Completed: 'bg-teal-50 text-teal-700 border-teal-200',
    'On Hold': 'bg-slate-100 text-slate-700 border-slate-300',
    'Backlog': 'bg-slate-100 text-slate-700 border-slate-200',
    'To Do': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'In Review': 'bg-orange-50 text-orange-700 border-orange-200',
    'Done': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const style = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;