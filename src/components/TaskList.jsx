import { useState } from 'react';
import { Plus, Search, List, CheckSquare, Star as StarIcon, AlertTriangle, Trash2, Check, FolderInput } from 'lucide-react';
import TaskItem from './TaskItem';

const TaskList = ({ 
  tasks, 
  setTasks, 
  currentProject,
  projects
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [batchAction, setBatchAction] = useState('');
  const [showMoveToProjectModal, setShowMoveToProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // 根据项目筛选任务
  const filteredByProject = currentProject 
    ? tasks.filter(task => task.projectId === currentProject.id)
    : tasks;

  // 根据搜索查询筛选任务
  const filteredBySearch = searchQuery.trim() === ''
    ? filteredByProject
    : filteredByProject.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // 根据过滤类型筛选任务
  const filteredTasks = (() => {
    switch(filterType) {
      case 'incomplete': 
        return filteredBySearch.filter(task => !task.completed);
      case 'completed': 
        return filteredBySearch.filter(task => task.completed);
      case 'starred': 
        return filteredBySearch.filter(task => task.starred);
      case 'p0': 
        return filteredBySearch.filter(task => task.priority === 'P0');
      case 'p1': 
        return filteredBySearch.filter(task => task.priority === 'P1');
      case 'p2': 
        return filteredBySearch.filter(task => task.priority === 'P2');
      default: 
        return filteredBySearch;
    }
  })();

  // 任务排序：星标 > 未完成 > 优先级
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 星标排序
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    
    // 完成状态排序
    if (!a.completed && b.completed) return -1;
    if (a.completed && !b.completed) return 1;
    
    // 优先级排序
    const priorityValue = { 'P0': 0, 'P1': 1, 'P2': 2 };
    return priorityValue[a.priority] - priorityValue[b.priority];
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      starred: false,
      priority: 'P2',
      projectId: currentProject?.id || null
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleToggleStar = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, starred: !task.starred } : task
    ));
  };

  const handleUpdateTitle = (taskId, newTitle) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, title: newTitle } : task
    ));
  };

  const handleUpdatePriority = (taskId, priority) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, priority } : task
    ));
  };

  const handleUpdateProject = (taskId, projectId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, projectId } : task
    ));
  };

  const confirmDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
    
    // 如果该任务在选择列表中，也要从选择列表中移除
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  // 批量操作相关函数
  const handleToggleSelect = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === sortedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(sortedTasks.map(task => task.id));
    }
  };

  const executeBatchAction = (action) => {
    if (selectedTasks.length === 0) return;

    switch(action) {
      case 'complete':
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, completed: true } : task
        ));
        break;
      case 'incomplete':
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, completed: false } : task
        ));
        break;
      case 'star':
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, starred: true } : task
        ));
        break;
      case 'unstar':
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, starred: false } : task
        ));
        break;
      case 'p0':
      case 'p1':
      case 'p2':
        const priority = action.toUpperCase();
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, priority } : task
        ));
        break;
      case 'delete':
        setTasks(tasks.filter(task => !selectedTasks.includes(task.id)));
        break;
      case 'move':
        if (currentProject) {
          setTasks(tasks.map(task => 
            selectedTasks.includes(task.id) ? { ...task, projectId: currentProject.id } : task
          ));
        }
        break;
      case 'moveToProject':
        // 将选中的任务移动到指定项目
        setTasks(tasks.map(task => 
          selectedTasks.includes(task.id) ? { ...task, projectId: selectedProjectId || null } : task
        ));
        setShowMoveToProjectModal(false);
        break;
      default:
        break;
    }

    setSelectedTasks([]);
    setShowBatchConfirm(false);
  };

  const confirmBatchAction = (action) => {
    if (selectedTasks.length === 0) return;
    
    if (action === 'delete') {
      setBatchAction('delete');
      setShowBatchConfirm(true);
    } else if (action === 'moveToProject') {
      setShowMoveToProjectModal(true);
    } else {
      executeBatchAction(action);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {currentProject ? currentProject.name : '所有任务'}
        </h2>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterButton 
            active={filterType === 'all'} 
            onClick={() => setFilterType('all')}
            icon={<List size={16} />}
            label="全部"
          />
          <FilterButton 
            active={filterType === 'incomplete'} 
            onClick={() => setFilterType('incomplete')}
            icon={<AlertTriangle size={16} />}
            label="未完成"
          />
          <FilterButton 
            active={filterType === 'completed'} 
            onClick={() => setFilterType('completed')}
            icon={<CheckSquare size={16} />}
            label="已完成"
          />
          <FilterButton 
            active={filterType === 'starred'} 
            onClick={() => setFilterType('starred')}
            icon={<StarIcon size={16} />}
            label="星标"
          />
          <FilterButton 
            active={filterType === 'p0'} 
            onClick={() => setFilterType('p0')}
            label="P0"
          />
          <FilterButton 
            active={filterType === 'p1'} 
            onClick={() => setFilterType('p1')}
            label="P1"
          />
          <FilterButton 
            active={filterType === 'p2'} 
            onClick={() => setFilterType('p2')}
            label="P2"
          />
        </div>
        
        <form onSubmit={handleAddTask} className="flex mb-4">
          <input
            type="text"
            placeholder="添加新任务..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 py-2 px-4 rounded-l-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg flex items-center"
          >
            <Plus size={18} />
            <span className="ml-1">添加</span>
          </button>
        </form>

        {/* 批量操作区域 */}
        {selectedTasks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="mr-2">
              <span className="font-medium">已选择 {selectedTasks.length} 项</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <BatchButton onClick={() => confirmBatchAction('complete')} icon={<CheckSquare size={14} />} label="标记完成" />
              <BatchButton onClick={() => confirmBatchAction('incomplete')} label="标记未完成" />
              <BatchButton onClick={() => confirmBatchAction('star')} icon={<StarIcon size={14} />} label="加星标" />
              <BatchButton onClick={() => confirmBatchAction('unstar')} label="取消星标" />
              <BatchButton onClick={() => confirmBatchAction('p0')} label="设为P0" />
              <BatchButton onClick={() => confirmBatchAction('p1')} label="设为P1" />
              <BatchButton onClick={() => confirmBatchAction('p2')} label="设为P2" />
              
              {/* 新增移动到项目按钮 */}
              <BatchButton 
                onClick={() => confirmBatchAction('moveToProject')} 
                icon={<FolderInput size={14} />} 
                label="移动到项目" 
              />
              
              {currentProject && (
                <BatchButton onClick={() => confirmBatchAction('move')} label={`移动到 ${currentProject.name}`} />
              )}
              <BatchButton
                onClick={() => confirmBatchAction('delete')} 
                icon={<Trash2 size={14} />} 
                label="删除" 
                className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300"
              />
            </div>
          </div>
        )}

        {/* 批量删除确认对话框 */}
        {showBatchConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">确认删除</h3>
              <p className="mb-6">您确定要删除选中的 {selectedTasks.length} 个任务吗？此操作不可撤销。</p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowBatchConfirm(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                >
                  取消
                </button>
                <button 
                  onClick={() => executeBatchAction('delete')}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 单个任务删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">确认删除</h3>
              <p className="mb-6">您确定要删除这个任务吗？此操作不可撤销。</p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleDeleteTask(taskToDelete)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 移动到项目模态框 */}
        {showMoveToProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">移动到项目</h3>
              <p className="mb-4">选择要将 {selectedTasks.length} 个任务移动到的项目：</p>
              
              <div className="mb-6">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">无项目</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowMoveToProjectModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                >
                  取消
                </button>
                <button 
                  onClick={() => executeBatchAction('moveToProject')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  移动
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {/* 全选按钮 */}
        {sortedTasks.length > 0 && (
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={selectedTasks.length > 0 && selectedTasks.length === sortedTasks.length}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 mr-2"
            />
            <label 
              onClick={handleSelectAll} 
              className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            >
              {selectedTasks.length === sortedTasks.length ? '取消全选' : '全选'}
            </label>
          </div>
        )}

        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <p className="text-center py-6 text-slate-500 dark:text-slate-400">没有符合条件的任务</p>
          ) : (
            sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onToggleStar={handleToggleStar}
                onUpdatePriority={handleUpdatePriority}
                onUpdateTitle={handleUpdateTitle}
                onUpdateProject={handleUpdateProject}
                onDelete={confirmDeleteTask}
                projects={projects}
                isSelected={selectedTasks.includes(task.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
      active 
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`}
  >
    {icon && <span className="mr-1.5">{icon}</span>}
    {label}
  </button>
);

const BatchButton = ({ onClick, icon, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-xs flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 ${className}`}
  >
    {icon && <span className="mr-1.5">{icon}</span>}
    {label}
  </button>
);

export default TaskList; 