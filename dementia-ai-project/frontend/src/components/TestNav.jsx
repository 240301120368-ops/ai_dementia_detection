import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tests = [
  { path: '/test/memory', label: 'Memory', icon: '🧠', num: 1 },
  { path: '/test/attention', label: 'Attention', icon: '🎯', num: 2 },
  { path: '/test/clock-drawing', label: 'Clock Drawing', icon: '🕰️', num: 3 },
  { path: '/test/visual-spatial', label: 'Visual-Spatial', icon: '△', num: 4 },
];

const TestNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Find current test index
  const currentIdx = tests.findIndex(t => t.path === currentPath);

  return (
    <nav className="w-full max-w-3xl mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center justify-between gap-1">
        {tests.map((test, i) => {
          const isCurrent = test.path === currentPath;
          const isPast = i < currentIdx;
          const isFuture = i > currentIdx;

          return (
            <button
              key={test.path}
              onClick={() => {
                if (isPast) navigate(test.path);
              }}
              disabled={isFuture}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex-1 justify-center
                ${isCurrent
                  ? 'bg-slate-900 text-white shadow-md'
                  : isPast
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isCurrent ? 'bg-white text-slate-900' : isPast ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-400'}
              `}>
                {isPast ? '✓' : test.num}
              </span>
              <span className="hidden sm:inline">{test.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TestNav;
