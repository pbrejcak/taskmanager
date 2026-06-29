import { useState, useEffect } from 'react';

function TaskList({ projectId, projectName, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false); 

  useEffect(() => {
    fetchTasks();
  }, [projectId]); 

  const fetchTasks = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch('http://localhost:8080/api/tasks/project/' + projectId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    const token = localStorage.getItem('jwtToken');

    const taskData = {
      title: newTaskTitle,
      description: newDescription,
      deadline: newDeadline ? newDeadline : null,
      status: "TODO" 
    };

    try {
      const response = await fetch('http://localhost:8080/api/tasks/project/' + projectId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(taskData) 
      });

      if (response.ok) {
        fetchTasks();
        setNewTaskTitle('');
        setNewDescription('');
        setNewDeadline('');
        setIsAddingTask(false);
      }
    } catch (err) {
      setError('Creating new tasks error.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Do you really want to delete this task?")) return;
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch('http://localhost:8080/api/tasks/' + taskId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) fetchTasks();
    } catch (err) {
      setError('Connection error!');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch('http://localhost:8080/api/tasks/' + taskId + '/status', {
        method: 'PUT',
        headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'text/plain' 
        },
        body: newStatus
      });
      if (response.ok) fetchTasks();
    } catch (err) {
      setError('Editing status error');
    }
  };

  const isOverdue = (deadlineString) => {
    if (!deadlineString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const deadlineDate = new Date(deadlineString);
    return deadlineDate < today; 
  };

  return (
    <div className="flex flex-col h-full">
      {/* HLAVIČKA MODALU */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Project tasks</h3>
          <p className="text-blue-600 font-medium text-sm">{projectName}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto">
        {error && <p className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100 font-medium">{error}</p>}

        {/* BUTTON / FORM FOR ADDIDNG TASK */}
        {!isAddingTask ? (
          <button 
            onClick={() => setIsAddingTask(true)} 
            className="w-full py-3 mb-6 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all font-bold"
          >
            <span>+</span> Add new task
          </button>
        ) : (
          <form onSubmit={handleCreateTask} className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner space-y-3 animate-in fade-in zoom-in duration-200">
            <input 
              type="text" 
              placeholder="What needs to be done? (Name)" 
              value={newTaskTitle} 
              onChange={(e) => setNewTaskTitle(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea 
              placeholder="More details..." 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              rows="2" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="date" 
                value={newDeadline} 
                onChange={(e) => setNewDeadline(e.target.value)} 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors"></button>
                <button type="button" onClick={() => setIsAddingTask(false)} className="bg-white border border-gray-300 text-gray-600 px-5 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">Cancel</button>
              </div>
            </div>
          </form>
        )}

        {/* LIST OF TASKS */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg italic">No tasks yet.</p>
            <p className="text-sm">Click on the button above and start planning!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const isDone = task.status === 'DONE';
              const isInProgress = task.status === 'IN_PROGRESS';

              return (
                <div key={task.id} className={`group bg-white border rounded-xl p-4 transition-all hover:shadow-md ${isDone ? 'border-gray-100 opacity-75' : 'border-gray-200'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* TEXTOVÁ ČASŤ */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-base font-bold truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </h4>
                        {isInProgress && <span className="inline-block 
                        animate-spin text-blue-500">🔄</span>}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded border border-gray-100 italic">
                          {task.description}
                        </p>
                      )}

                      {task.deadline && (
                        <div className={`text-xs mt-2 font-bold flex items-center gap-1 ${ (isOverdue(task.deadline) && !isDone) ? 'text-red-500' : 'text-green-600' }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due to: {task.deadline}
                        </div>
                      )}
                    </div>
                    
                    {/* OVLÁDACIA ČASŤ */}
                    <div className="flex items-center gap-2 sm:self-end md:self-center">
                      <select 
                        value={task.status || "TODO"} 
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className={`text-sm px-3 py-1.5 rounded-lg border-2 font-bold cursor-pointer outline-none transition-all
                          ${isDone ? 'bg-green-50 border-green-200 text-green-700' : 
                            isInProgress ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                            'bg-gray-50 border-gray-200 text-gray-700'}`}
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In proces</option>
                        <option value="DONE">Done</option>
                      </select>

                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;