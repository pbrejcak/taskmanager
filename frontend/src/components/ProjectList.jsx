import { useState, useEffect } from 'react';
import TaskList from './TaskList';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects(0);
  }, []);

  const fetchProjects = async (pageToFetch) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setError('You do not have a token yet. Logi in first!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/projects?page=' + pageToFetch, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.content);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
      } else {
        setError('Could not load the projects :(');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim() === '') return;

    const token = localStorage.getItem('jwtToken');

    try {
      const response = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ name: newProjectName }) 
      });

      if (response.ok) {
        fetchProjects(currentPage);
        setNewProjectName(''); 
      } else {
        setError('Nepodarilo sa vytvoriť projekt.');
      }
    } catch (err) {
      setError('Chyba pripojenia k serveru.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Do you really want to delete this project and all its tasks?")) return;

    const token = localStorage.getItem('jwtToken');

    try {
      const response = await fetch('http://localhost:8080/api/projects/' + projectId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        fetchProjects(currentPage);
      } else {
        setError('Could not load the project. Maybe it is not yours?');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      {/* HLAVNÁ KARTA */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* HLAVIČKA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center shadow-md">
          <h2 className="text-2xl font-extrabold tracking-wide">My projects</h2>
        </div>

        {/* TELO NÁSTENKY */}
        <div className="p-6 md:p-8">
          {error && <p className="text-red-500 font-semibold mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          {/* FORMULÁR NA NOVÝ PROJEKT */}
          <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <input 
              type="text" 
              placeholder="Name of the new project..." 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm">
              + Make new project
            </button>
          </form>

          {projects.length === 0 && !error && (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">You do not have any project yet. Make your first now!</p>
            </div>
          )}

          {/*LIST OF PROJECTS (GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((projekt) => (
              <div key={projekt.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                <strong className="text-lg text-gray-800 truncate pr-4">{projekt.name}</strong> 
                
                <div className="flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedProject(projekt)}
                    className="bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
                  >
                    Show tasks
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(projekt.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGING */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={() => fetchProjects(currentPage - 1)} 
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium shadow-sm"
              >
                &lt; Previous
              </button>
              
              <span className="text-gray-600 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                Strana {currentPage + 1} z {totalPages}
              </span>
              
              <button 
                onClick={() => fetchProjects(currentPage + 1)} 
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium shadow-sm"
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VYSKAKOVACIE OKNO (MODAL) PRE ÚLOHY */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            {/* Zatiaľ tu voláme starý TaskList, ale ten dostane Tailwind o chvíľu! */}
            <TaskList 
              projectId={selectedProject.id} 
              projectName={selectedProject.name} 
              onClose={() => setSelectedProject(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;