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
    <header className="bg-transparent border-b border-transparent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo.png"
              alt="BarkBarber Logo"
              className="h-32 w-32 object-contain"
            />
            <div className="flex flex-col">
              
            </div>
          </Link>

          {showAuth ? (
            <div className="flex items-center space-x-6">
              {userName && (
                <div className="hidden sm:flex items-center space-x-2">
                  
                  <span className="text-gray-700 font-medium ml-2">
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
