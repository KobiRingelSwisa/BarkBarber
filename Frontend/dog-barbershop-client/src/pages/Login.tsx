import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { PawsBackground } from '../components/PawsBackground';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <PawsBackground backgroundColor="#E8F5E9" patternColor="#C8E6C9" />
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <div className="relative">
              <div className="w-full max-w-md mx-auto flex items-center justify-center">
                <img
                  src="/dog-illustration.png"
                  alt="כלב חמוד"
                  className="w-full h-full max-w-sm object-contain"
                />
              </div>
            </div>
          </div>

          <Card 
            className="w-full p-8 lg:p-10 shadow-2xl"
            spotlightColor="rgba(129, 199, 132, 0.2)"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-amber-900 mb-3">
                ברוך שובך
              </h2>
              <p className="text-lg text-amber-800">התחבר כדי לנהל את התורים שלך</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Input
                label="שם משתמש"
                type="text"
                placeholder="הכנס את שם המשתמש שלך"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="סיסמה"
                type="password"
                placeholder="הכנס את הסיסמה שלך"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full mt-8 bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    מתחבר...
                  </span>
                ) : (
                  'התחבר'
                )}
              </Button>

              <div className="text-center pt-6 border-t border-amber-200">
                <p className="text-sm text-amber-800">
                  אין לך חשבון?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-amber-900 hover:text-amber-700 transition-colors underline"
                  >
                    הירשם כאן
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
