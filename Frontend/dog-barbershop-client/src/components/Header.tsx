import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  showAuth?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showAuth = false,
  userName,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo.png"
              alt="BarkBarber Logo"
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-amber-800 font-bold text-2xl tracking-tight">
                BarkBarber
              </span>
            </div>
          </Link>

          {showAuth ? (
            <div className="flex items-center space-x-6">
              {userName && (
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center">
                    <span className="text-amber-100 font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    ברוך הבא, {userName}
                  </span>
                </div>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  התנתק
                </button>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-all duration-200 text-sm font-semibold"
            >
              התחבר
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
