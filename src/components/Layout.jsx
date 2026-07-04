import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Layout() {
  const { setAdminModalOpen } = useGameStore();
  const location = useLocation();

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('aqsa_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('aqsa_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ================= الشريط العلوي (Navbar) ================= */}
      <header className="glass-panel" style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* شعار التطبيق باللغة العربية */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🕌</span>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              فتوحات صلاح الدين الأيوبي - طريق القدس
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              نظام تعليمي وتربوي متكامل لتتبع تقدم الطلاب
            </p>
          </div>
        </div>

        {/* أزرار التنقل الرئيسية والمظهر */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary"
            style={{ fontWeight: 700, gap: '0.25rem' }}
          >
            {theme === 'dark' ? '💡 المظهر المضيء' : '🌙 المظهر الداكن'}
          </button>

          <Link 
            to="/" 
            className={`btn ${location.pathname === '/' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🏠 المواسم (الرئيسية)
          </Link>
          
          <Link 
            to="/map" 
            className={`btn ${location.pathname === '/map' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 700, backgroundColor: location.pathname === '/map' ? 'var(--primary)' : 'rgba(16, 185, 129, 0.1)', color: location.pathname === '/map' ? '#fff' : '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            🗺️ الخريطة
          </Link>

          <Link 
            to="/hall-of-fame" 
            className={`btn ${location.pathname === '/hall-of-fame' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 700, backgroundColor: location.pathname === '/hall-of-fame' ? 'var(--primary)' : 'rgba(245, 158, 11, 0.1)', color: location.pathname === '/hall-of-fame' ? '#fff' : '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            🏆 الفاتحون
          </Link>

          <button 
            onClick={() => setAdminModalOpen(true)} 
            className="btn btn-secondary"
          >
            🛠️ إدارة النظام
          </button>
        </div>
      </header>

      {/* ================= المحتوى الرئيسي للموقع ================= */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* ================= التذييل (Footer) ================= */}
      <footer className="glass-panel" style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام فتوحات القدس التعليمي
      </footer>
    </div>
  );
}
