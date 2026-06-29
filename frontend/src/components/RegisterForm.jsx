import { useState } from 'react';

function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // --- Security checks ---
    if (password !== confirmPassword) {
      setMessage('Chyba: Heslá sa nezhodujú!');
      return; 
    }

    if (password.length < 8) {
      setMessage('Chyba: Heslo musí mať aspoň 8 znakov!');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password); 
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpperCase || !hasNumber) {
      setMessage('Chyba: Heslo musí obsahovať aspoň 1 veľké písmeno a 1 číslo!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      if (response.ok) {
        onRegisterSuccess();
      } else {
        setMessage('Registration failed. Maybe the name already exist?');
      }
    } catch (error) {
      setMessage('Server not responding, is it working?');
    }
  };

  return (
    // ZÁKLADNÁ KARTA (Obal formulára) - Rovnaký štýl ako Login, len fialový okraj hint
    // Base window - same style as login, but with purple hint
    <div className="max-w-md w-full mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">New Registration</h2>
      
      <form onSubmit={handleRegister} className="space-y-2 flex flex-col">
        <div className="grid grid-cols-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            // Tailwind štýly pre políčko (s fialovým focus efektom)
            //Tailwind style for button (with purple effect)
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300"
            placeholder="Choose your username"
          />
        </div>
        
        <div className="grid grid-cols-2 ">
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300"
            placeholder="Min. 8 characters, 1 Uppercase, 1 number"
          />
        </div>

        <div className="grid grid-cols-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Repeat your password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300"
            placeholder="Type password again"
          />
        </div>
        
        {/* FIALOVÉ TLAČIDLO (s efektmi pri hover) */}
        <button type="submit" className="w-full py-2 px-4 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-colors duration-200 mt-6">
          Registration
        </button>
      </form>
      
      {/* Pevná výška pre chybovú hlášku s pulzujúcim efektom */}
      <div className="h-6 mt-4 text-center">
        {message && (
          <p className="text-sm font-semibold text-red-500 animate-pulse">{message}</p>
        )}
      </div>
      
      {/* Spodná časť na prepnutie k loginu */}
      <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors">
          Log yourself hier
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;