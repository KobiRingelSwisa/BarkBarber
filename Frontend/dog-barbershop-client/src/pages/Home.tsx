import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-amber-900 leading-tight">
              קביעת תורים למספרת כלבים - פשוט וקל
            </h1>
            <p className="text-xl text-amber-800 leading-relaxed">
              קבע תור לתספורת הכלב שלך בקלות ובנוחות עם BarkBarber
            </p>
            <div className="pt-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 shadow-lg">
                  קבע תור עכשיו
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-700 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-amber-600 rounded-full opacity-30 animate-pulse delay-75"></div>
              <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                <svg className="w-full h-full text-amber-800" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" fill="#FEEFAD" stroke="#4A3F35" strokeWidth="3"/>
                  <circle cx="80" cy="80" r="8" fill="#4A3F35"/>
                  <circle cx="120" cy="80" r="8" fill="#4A3F35"/>
                  <path d="M 70 110 Q 100 130 130 110" stroke="#4A3F35" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <ellipse cx="100" cy="140" rx="30" ry="20" fill="#4A3F35"/>
                  <path d="M 50 60 Q 30 50 20 70" stroke="#4A3F35" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <path d="M 150 60 Q 170 50 180 70" stroke="#4A3F35" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <path d="M 100 50 Q 90 30 100 20" stroke="#4A3F35" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <circle cx="85" cy="45" r="3" fill="#4A3F35"/>
                  <circle cx="115" cy="45" r="3" fill="#4A3F35"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 lg:py-24">
          <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">איך זה עובד</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-teal-100 rounded-2xl p-8 mb-4 shadow-md hover:shadow-xl transition-shadow">
                <svg className="w-16 h-16 mx-auto text-amber-800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 50 L30 70 L50 70 L50 50 Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <circle cx="35" cy="45" r="3" fill="currentColor"/>
                  <circle cx="45" cy="45" r="3" fill="currentColor"/>
                  <circle cx="40" cy="50" r="3" fill="currentColor"/>
                  <path d="M20 60 L30 70 M50 70 L60 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-900 font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-amber-900">הירשם</h3>
              </div>
              <p className="text-amber-800">צור חשבון תוך שניות</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-2xl p-8 mb-4 shadow-md hover:shadow-xl transition-shadow">
                <svg className="w-16 h-16 mx-auto text-amber-800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="30" width="60" height="8" rx="2" fill="currentColor"/>
                  <line x1="25" y1="38" x2="25" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="35" y1="38" x2="35" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="45" y1="38" x2="45" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="55" y1="38" x2="55" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="65" y1="38" x2="65" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="75" y1="38" x2="75" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-900 font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-amber-900">בחר שירות</h3>
              </div>
              <p className="text-amber-800">בחר את חבילת התספורת המושלמת</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-2xl p-8 mb-4 shadow-md hover:shadow-xl transition-shadow">
                <svg className="w-16 h-16 mx-auto text-amber-800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="25" fill="#FEEFAD" stroke="#4A3F35" strokeWidth="3"/>
                  <circle cx="42" cy="45" r="4" fill="#4A3F35"/>
                  <circle cx="58" cy="45" r="4" fill="#4A3F35"/>
                  <path d="M 40 58 Q 50 65 60 58" stroke="#4A3F35" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-900 font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-amber-900">הבא את הכלב</h3>
              </div>
              <p className="text-amber-800">תהנה משירות תספורת מקצועי</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

