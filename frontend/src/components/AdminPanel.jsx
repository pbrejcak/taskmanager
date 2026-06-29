import { useState, useEffect } from 'react';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('You do not have a perrmision to see this page.');
      }
    } catch (err) {
      setError('Sever connection fail.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Do you really want to delete this user: ${username} ? This step is irreversible!`)) return;

    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch('http://localhost:8080/api/admin/users/' + userId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        fetchUsers(); // Znovu načíta aktualizovaný zoznam
      } else {
        setError('Error by deleting the user.');
      }
    } catch (err) {
      setError('Server connection error!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-6 text-white flex justify-between items-center shadow-md">
          <h2 className="text-2xl font-extrabold tracking-wide">🔥 Admin Panel: User management</h2>
        </div>

        <div className="p-6 md:p-8">
          {error && <p className="text-red-500 font-semibold mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">User name</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 font-medium">{user.id}</td>
                    <td className="p-4 text-gray-800 font-bold">{user.username}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;