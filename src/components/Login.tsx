import { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_APP_PASSWORD;
    
    if (password === correctPassword) {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
          Maritime Casualties
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
          Enter password to access the heatmap
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-lg border ${
                error 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
              } focus:ring-2 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">Incorrect password</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Access Map
          </button>
        </form>
      </div>
    </div>
  );
}
