import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Button } from "../components/Button";

export const Home: React.FC = () => {
  const steps = [
    {
      title: "הירשם",
      description: "צור חשבון תוך שניות וקבל גישה לניהול התורים שלך בכל זמן.",
      icon: (
        <svg
          className="w-16 h-16 text-amber-800"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30 50 L30 70 L50 70 L50 50 Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="35" cy="45" r="3" fill="currentColor" />
          <circle cx="45" cy="45" r="3" fill="currentColor" />
          <circle cx="40" cy="50" r="3" fill="currentColor" />
          <path
            d="M20 60 L30 70 M50 70 L60 60"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "בחר שירות",
      description:
        "בחר את חבילת התספורת המושלמת לכלב שלך לפי גודל, זמן ותקציב.",
      icon: (
        <svg
          className="w-16 h-16 text-amber-800"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="20"
            y="30"
            width="60"
            height="8"
            rx="2"
            fill="currentColor"
          />
          <line
            x1="25"
            y1="38"
            x2="25"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="35"
            y1="38"
            x2="35"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="45"
            y1="38"
            x2="45"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="55"
            y1="38"
            x2="55"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="65"
            y1="38"
            x2="65"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="75"
            y1="38"
            x2="75"
            y2="70"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "הבא את הכלב",
      description: "הגיע בזמן המתוכנן ותן לצוות שלנו לפנק את הכלב שלך באהבה.",
      icon: (
        <svg
          className="w-16 h-16 text-amber-800"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="#FEEFAD"
            stroke="#4A3F35"
            strokeWidth="3"
          />
          <circle cx="42" cy="45" r="4" fill="#4A3F35" />
          <circle cx="58" cy="45" r="4" fill="#4A3F35" />
          <path
            d="M 40 58 Q 50 65 60 58"
            stroke="#4A3F35"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
  ];

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
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 shadow-lg"
                >
                  קבע תור עכשיו
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                <img
                  src="/dog-illustration.png"
                  alt="כלב חמוד"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 lg:py-24">
          <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">
            איך זה עובד
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-3xl border border-white/40 bg-teal-100/80 backdrop-blur shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 transition-all duration-300 group-hover:via-amber-100/20 group-hover:to-amber-200/40" />

                <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 shadow-sm">
                      שלב {index + 1}
                    </span>
                  </div>

                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/90 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:blur-sm">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-amber-900">
                    {step.title}
                  </h3>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-amber-900 transition-all duration-500 bg-gradient-to-br from-white/0 to-white/0 backdrop-blur-sm md:opacity-0 md:group-hover:from-white/95 md:group-hover:to-amber-100/95 md:group-hover:opacity-100 md:z-20">
                  <h3 className="text-2xl font-bold text-amber-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-amber-800">
                    {step.description}
                  </p>
                </div>

                <div className="relative z-10 px-6 pb-6 text-sm leading-relaxed text-amber-800 md:hidden">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
