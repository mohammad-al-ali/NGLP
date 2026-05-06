import { useState } from 'react';
import './Layout.css';
import LessonList from '../lessons/LessonList'; // استيراد المكون الجديد

export default function Layout() {
  const [showPrimary, setShowPrimary] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  
  // 🌟 State جديدة: تذكر رقم الدرس الحالي المختار (نبدأ بدون اختيار = null)
  const [currentLessonId, setCurrentLessonId] = useState(null);

  return (
    <div className="ide-container">
      <div className="ide-main-area">
        
        <div className="activity-bar">
          <div title="Home">🏠</div>
          <div title="Profile" style={{marginTop: '20px'}}>👤</div>
        </div>

        {/* استبدال القائمة الثابتة بالمكون الديناميكي */}
        {showPrimary && (
          <aside className="primary-sidebar">
            <LessonList 
              currentLessonId={currentLessonId} 
              onSelectLesson={setCurrentLessonId} 
            />
          </aside>
        )}

        <main className="editor-area">
          <div className="video-player-section">
            {/* سيتم تغيير هذا لاحقاً ليعرض فيديو الدرس المختار */}
            <h2>{currentLessonId ? `🎬 جاري عرض الدرس رقم: ${currentLessonId}` : '👈 يرجى اختيار درس من القائمة'}</h2>
          </div>

          {showPanel && (
            <div className="bottom-panel">
              <h3>📝 تفاصيل الدرس (Panel)</h3>
              <p>هنا سيعرض العنوان والوصف الخاص بالدرس.</p>
            </div>
          )}
        </main>

        {showSecondary && (
          <aside className="secondary-sidebar">
            <h3>🤖 المعلم الذكي (AI)</h3>
            <p>مساحة الدردشة مع الذكاء الاصطناعي ستكون هنا.</p>
          </aside>
        )}

      </div>

      <footer className="status-bar">
        <div>NGLP Learning IDE</div>
        <div className="toggle-buttons">
          <button onClick={() => setShowPrimary(!showPrimary)}>Toggle Primary</button>
          <button onClick={() => setShowPanel(!showPanel)}>Toggle Panel</button>
          <button onClick={() => setShowSecondary(!showSecondary)}>Toggle Secondary</button>
        </div>
      </footer>
    </div>
  );
}