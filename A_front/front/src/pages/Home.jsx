import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); // Вы можете сохранять роль пользователя при логине

  return (
    <div className="home-container">
      <h1>Welcome to ShortHack Platform</h1>
      
      {userRole === 'STUDENT' ? (
        <div className="student-actions">
          <h2>Student Actions</h2>
          <button onClick={() => navigate('/events')} className="btn primary-btn">
            View Events
          </button>
        </div>
      ) : userRole === 'MANAGER' ? (
        <div className="manager-actions">
          <h2>Manager Actions</h2>
          <button onClick={() => navigate('/analytics')} className="btn primary-btn">
            View Analytics
          </button>
        </div>
      ) : (
        <div className="role-selection">
          <h2>Choose your role</h2>
          <button onClick={() => navigate('/events')} className="btn primary-btn">
            I'm a Student
          </button>
          <button onClick={() => navigate('/analytics')} className="btn secondary-btn">
            I'm a Manager
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;