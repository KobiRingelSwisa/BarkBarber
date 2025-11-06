import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, password, firstName);
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'הרישום נכשל');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-700 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-amber-600 rounded-full opacity-30 animate-pulse delay-75"></div>
              <div className="w-full max-w-md mx-auto flex items-center justify-center">
                <svg className="w-full h-full text-amber-800" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="150" cy="150" r="120" fill="#FEEFAD" stroke="#4A3F35" strokeWidth="4"/>
                  <circle cx="120" cy="120" r="12" fill="#4A3F35"/>
                  <circle cx="180" cy="120" r="12" fill="#4A3F35"/>
                  <path d="M 105 165 Q 150 185 195 165" stroke="#4A3F35" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <ellipse cx="150" cy="210" rx="45" ry="30" fill="#4A3F35"/>
                  <path d="M 75 90 Q 45 75 30 105" stroke="#4A3F35" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <path d="M 225 90 Q 255 75 270 105" stroke="#4A3F35" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <path d="M 150 75 Q 135 45 150 30" stroke="#4A3F35" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <circle cx="127" cy="68" r="4" fill="#4A3F35"/>
                  <circle cx="173" cy="68" r="4" fill="#4A3F35"/>
                </svg>
              </div>
            </div>
          </div>

          <Card className="w-full p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-amber-900 mb-3">
                צור חשבון
              </h2>
              <p className="text-lg text-amber-800">הצטרף אלינו וקבע תור לתספורת הכלב שלך</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Input
                label="שם פרטי"
                type="text"
                placeholder="הכנס את השם הפרטי שלך"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="שם משתמש"
                type="text"
                placeholder="בחר שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="סיסמה"
                type="password"
                placeholder="צור סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full mt-6 bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    יוצר חשבון...
                  </span>
                ) : (
                  'צור חשבון'
                )}
              </Button>

              <div className="text-center pt-6 border-t border-amber-200">
                <p className="text-sm text-amber-800">
                  כבר יש לך חשבון?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-amber-900 hover:text-amber-700 transition-colors underline"
                  >
                    התחבר כאן
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
