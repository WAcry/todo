import { useState, useEffect } from 'react'
import './App.css'
import { Sun, Moon, Github } from 'lucide-react'
import ProjectSidebar from './components/ProjectSidebar'
import TaskList from './components/TaskList'

function App() {
  // 暗黑模式状态
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // 应用主要状态
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects')
    const initialValue = saved ? JSON.parse(saved) : [
      { id: '1', name: '工作' },
      { id: '2', name: '个人' }
    ]
    return initialValue
  })

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [currentProject, setCurrentProject] = useState(null)

  // 保存暗黑模式状态到本地存储
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // 保存项目和任务到本地存储
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  // 自定义项目更新函数，以便同时处理任务
  const handleProjectsUpdate = (newProjects) => {
    // 查找被删除的项目
    const deletedProjectIds = projects
      .filter(project => !newProjects.some(p => p.id === project.id))
      .map(project => project.id);

    // 如果有项目被删除，将其中的任务设为无项目（而不是删除）
    if (deletedProjectIds.length > 0) {
      setTasks(tasks.map(task => 
        deletedProjectIds.includes(task.projectId) 
          ? { ...task, projectId: null } 
          : task
      ));
    }

    // 更新项目列表
    setProjects(newProjects);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">TODOs</h1>
          
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/WAcry/todo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="GitHub 仓库"
            >
              <Github size={20} />
            </a>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={darkMode ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ProjectSidebar 
              projects={projects}
              setProjects={handleProjectsUpdate}
              currentProject={currentProject}
              setCurrentProject={setCurrentProject}
              allTasks={tasks}
            />
          </div>
          <div className="md:col-span-3">
            <TaskList 
              tasks={tasks}
              setTasks={setTasks}
              currentProject={currentProject}
              projects={projects}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
