import { useState } from 'react';
import { Plus, Trash2, Edit, Folder, Check, X, AlertTriangle } from 'lucide-react';

const ProjectSidebar = ({ 
  projects, 
  setProjects, 
  currentProject, 
  setCurrentProject,
  allTasks
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleAddProject = () => {
    if (newProjectName.trim() === '') return;
    
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim()
    };
    
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const handleUpdateProject = () => {
    if (newProjectName.trim() === '' || !editingProject) return;
    
    setProjects(projects.map(project => 
      project.id === editingProject.id 
        ? { ...project, name: newProjectName.trim() } 
        : project
    ));
    
    setEditingProject(null);
    setNewProjectName('');
  };

  const handleDeleteProject = (projectId) => {
    // 设置要删除的项目并显示确认对话框（始终显示）
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const performDeleteProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }

    // 清除确认对话框状态
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  const startEditing = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setNewProjectName('');
  };

  const cancelAdding = () => {
    setIsAddingProject(false);
    setNewProjectName('');
  };

  // 获取每个项目的任务数量
  const getTaskCount = (projectId) => {
    return allTasks.filter(task => task.projectId === projectId && !task.completed).length;
  };

  // 获取所有未完成任务的数量
  const getAllTasksCount = () => {
    return allTasks.filter(task => !task.completed).length;
  };

  // 获取项目中的任务数量（用于删除确认）
  const getProjectTaskCount = (projectId) => {
    return allTasks.filter(task => task.projectId === projectId).length;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">项目</h2>
        <button 
          onClick={() => setIsAddingProject(true)} 
          className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200"
          disabled={isAddingProject}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mb-4">
        <div 
          className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${
            currentProject === null ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          onClick={() => setCurrentProject(null)}
        >
          <div className="flex items-center">
            <Folder size={18} className="mr-2" />
            <span>所有项目</span>
          </div>
          <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full">
            {getAllTasksCount()}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {isAddingProject && (
          <div className="flex items-center p-2 bg-slate-100 dark:bg-slate-700 rounded">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="项目名称"
              className="flex-1 bg-transparent border-none outline-none"
              autoFocus
            />
            <button onClick={handleAddProject} className="p-1 text-green-600 dark:text-green-400">
              <Check size={18} />
            </button>
            <button onClick={cancelAdding} className="p-1 text-red-600 dark:text-red-400">
              <X size={18} />
            </button>
          </div>
        )}

        {projects.map(project => (
          <div 
            key={project.id} 
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              currentProject?.id === project.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {editingProject?.id === project.id ? (
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none"
                  autoFocus
                />
                <button onClick={handleUpdateProject} className="p-1 text-green-600 dark:text-green-400">
                  <Check size={18} />
                </button>
                <button onClick={cancelEditing} className="p-1 text-red-600 dark:text-red-400">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div 
                  className="flex items-center flex-1"
                  onClick={() => setCurrentProject(project)}
                >
                  <Folder size={18} className="mr-2" />
                  <span>{project.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full mr-2">
                    {getTaskCount(project.id)}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(project);
                    }} 
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }} 
                    className="p-1 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 删除项目确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center mb-4 text-amber-500">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">警告</h3>
            </div>
            <p className="mb-4">
              您确定要删除"{projects.find(p => p.id === projectToDelete)?.name}"项目吗？
            </p>
            {getProjectTaskCount(projectToDelete) > 0 && (
              <p className="mb-4">
                项目中的任务({getProjectTaskCount(projectToDelete)}个)将保留，但会变为"无项目"状态。
              </p>
            )}
            <p className="mb-6">
              此操作不可撤销，是否继续？
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                取消
              </button>
              <button 
                onClick={() => performDeleteProject(projectToDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar; 