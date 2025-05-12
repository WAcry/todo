import { useState } from 'react';
import { Star, Trash2, StarOff, CheckSquare, Edit, Check, X } from 'lucide-react';

const priorityColors = {
  P0: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-white border-red-200 dark:border-red-700',
  P1: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-white border-yellow-200 dark:border-yellow-700',
  P2: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white border-blue-200 dark:border-blue-700',
};

const TaskItem = ({ 
  task, 
  onToggleComplete, 
  onToggleStar, 
  onUpdatePriority,
  onUpdateTitle,
  onUpdateProject,
  onDelete,
  projects,
  isSelected,
  onToggleSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleTitleSubmit = () => {
    if (editTitle.trim() !== '') {
      onUpdateTitle(task.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  };

  return (
    <div className={`mb-2 p-3 rounded-lg shadow-sm bg-white dark:bg-slate-800 border ${
      isSelected 
        ? 'border-blue-500 dark:border-blue-400' 
        : 'border-slate-200 dark:border-slate-700'
    } ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(task.id)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 mr-2"
            />
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button 
                  onClick={handleTitleSubmit}
                  className="ml-2 p-1 rounded-full text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(task.title);
                  }}
                  className="ml-1 p-1 rounded-full text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className={`font-medium ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                  {task.title}
                </span>
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setEditTitle(task.title);
                  }}
                  className="ml-2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  <Edit size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {projects && projects.length > 0 && (
            <select
              value={task.projectId || ''}
              onChange={(e) => onUpdateProject(task.id, e.target.value || null)}
              className="text-xs px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">无项目</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          )}
          
          <select
            value={task.priority}
            onChange={(e) => onUpdatePriority(task.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded-md border font-medium ${priorityColors[task.priority]}`}
          >
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
          
          <button 
            onClick={() => onToggleStar(task.id)}
            className={`p-1 rounded-full transition-colors duration-200 ${
              task.starred 
                ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
                : 'text-slate-400 hover:text-yellow-500 dark:text-slate-500 dark:hover:text-yellow-400'
            }`}
          >
            {task.starred ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
          </button>
          
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-full text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors duration-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 