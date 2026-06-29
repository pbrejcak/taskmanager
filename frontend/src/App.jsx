import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProjectList from './components/ProjectList';
import AdminPanel from './components/AdminPanel'; // ADDED IMPORT

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // NEW MEMORY FOR ROLES AND SWITCHING BETWEEN ADMIN PANEL
  const [userRole, setUserRole] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole'); // PICK ROLE FROM THE MEMORY
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    setShowAdminPanel(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      
      {/* HLAVIČKA A LOGO */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
            My<span className="text-blue-600">Task</span>Manager
          </h1>
          
          {/* Small badge next to logo, if you are an admin. */}
          {userRole === 'ADMIN' && (
            <span className="ml-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              ADMIN
            </span>
          )}
        </div>

        {/* OVLÁDACIE PRVKY VPRAVO */}
        <div className="flex gap-3">
          {isLoggedIn && userRole === 'ADMIN' && (
             <button 
               onClick={() => setShowAdminPanel(!showAdminPanel)}
               className="bg-purple-100 border border-purple-300 hover:bg-purple-200 text-purple-800 px-5 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm"
             >
               {showAdminPanel ? 'Back to Projects' : 'User Management'}
             </button>
          )}

          {isLoggedIn && (
            <button 
              onClick={handleLogout} 
              className="bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm"
            >
              Log out
            </button>
          )}
        </div>
      </div>
      
      {/* SWITCH BETWEEN THE WORLDS */}
      <div className="max-w-5xl mx-auto">
        {isLoggedIn ? (
          // If you are logged in, AdminPanel or projects will be shown depending from what is (zakliknute)
          showAdminPanel ? <AdminPanel /> : <ProjectList />
        ) : showRegister ? (
          <RegisterForm 
            onRegisterSuccess={() => {
              alert('Successfully registered! Now you can log in with your new account.');
              setShowRegister(false);
            }}
            onSwitchToLogin={() => setShowRegister(false)} 
          />
        ) : (
          <LoginForm 
            onLoginSuccess={(role) => {
              setIsLoggedIn(true);
              setUserRole(role);
            }} 
            onSwitchToRegister={() => setShowRegister(true)} 
          />
        )}
      </div>
      
    </div>
  );
}

export default App;