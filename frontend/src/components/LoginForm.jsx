import { useState, useEffect } from 'react';

function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (isLocked && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isLocked && timeLeft === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setMessage('');
    }
    return () => clearTimeout(timer);
  }, [isLocked, timeLeft]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', { // Prispôsob si URL ak máš inú
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Odpoveď od Javy je:", data);
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userRole', data.Role);
        setFailedAttempts(0);
        onLoginSuccess(data.Role); 
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setTimeLeft(30);
          setMessage('Too many failed attempts. Wait 30 seconds.');
        } else {
          setMessage(`Bad username or password! (Tries remaining: ${3 - newAttempts})`);
        }
      }
    } catch (error) {
      setMessage('Server not responding, is it working?');
    }
  };

  return (
    // Added Tailwind for better visual effect
    <div className="max-w-md w-full mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Log in</h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            disabled={isLocked}
            // Tailwinds styles 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
            placeholder="Type in your name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLocked}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLocked}
          // Tailwind styles for button
          className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-colors duration-200 ${
            isLocked 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLocked ? `Zamknuté (${timeLeft}s)` : 'Log in'}
        </button>
      </form>
      
      {/* Pevná výška pre chybovú hlášku, aby nám neposkakovalo UI */}
      <div className="h-6 mt-4 text-center">
        {message && (
          <p className="text-sm font-semibold text-red-500 animate-pulse">{message}</p>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
        Do not have an account yet?{' '}
        <button 
          onClick={onSwitchToRegister} 
          disabled={isLocked} 
          className="text-blue-600 font-semibold hover:text-blue-800 hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
        >
          Register yourself
        </button>
      </div>
    </div>
  );
}

export default LoginForm;