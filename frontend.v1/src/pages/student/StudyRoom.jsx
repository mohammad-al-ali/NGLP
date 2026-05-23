import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getCurrentUserId } from '../../services/api';
import { courses as defaultCourses, lessonsByCourse, normalizeCourse, normalizeLesson, resolveMediaUrl } from '../../utils/constants';

export default function StudyRoom() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const fallbackCourse = useMemo(() => defaultCourses.find((item) => String(item.id) === courseId) || defaultCourses[0], [courseId]);
  
  const [course, setCourse] = useState(fallbackCourse);
  const [lessons, setLessons] = useState(lessonsByCourse[fallbackCourse.id] || lessonsByCourse[1]);
  const activeLesson = lessons.find((l) => String(l.id) === lessonId) || lessons[0] || lessonsByCourse[1][0];
  
  // Sidebars toggle states
  const [showLessons, setShowLessons] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showTutor, setShowTutor] = useState(true);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about this lesson, the transcript, or what to review next.' },
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch course & lessons list
  useEffect(() => {
    let isMounted = true;
    async function loadStudyRoom() {
      try {
        const [courseResponse, lessonsResponse] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/lessons', { params: { courseId } }),
        ]);
        if (isMounted) {
          setCourse(normalizeCourse(courseResponse.data));
          setLessons(lessonsResponse.data.map(normalizeLesson));
        }
      } catch (err) {
        console.warn('Failed to load study room details from backend. Reverting to local mock.', err);
        if (isMounted) {
          setCourse(fallbackCourse);
          setLessons(lessonsByCourse[fallbackCourse.id] || lessonsByCourse[1]);
        }
      }
    }
    loadStudyRoom();
    return () => {
      isMounted = false;
    };
  }, [courseId, fallbackCourse]);

  // Send message to AI Tutor
  async function sendMessage(event) {
    event.preventDefault();
    if (!chatMessage.trim() || isSending) return;

    const studentMessage = { role: 'student', text: chatMessage.trim() };
    setMessages((current) => [...current, studentMessage]);
    setChatMessage('');
    setIsSending(true);

    try {
      const response = await api.post('/ai/messages', {
        userId: getCurrentUserId(),
        lessonId: activeLesson.id,
        timestamp: 0,
        message: studentMessage.text,
      });
      setMessages((current) => [...current, { 
        role: 'assistant', 
        text: response.data.response || response.data.reply || 'I received your query but cannot formulate a response.' 
      }]);
    } catch (err) {
      console.warn('AI Chat request failed. Reverting to offline tutor mock.', err);
      setMessages((current) => [
        ...current,
        { 
          role: 'assistant', 
          text: `Offline tutor note: Review the key themes in "${activeLesson.title}". The video player and details panel below outline the lesson's main core competencies.` 
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden', 
        color: 'var(--text-main)', 
        backgroundColor: 'var(--bg)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Top Navigation Strip */}
      <header 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '52px',
          padding: '0 20px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          flex: '0 0 auto',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: '800', 
              fontSize: '1.2rem',
              color: 'var(--primary)',
              letterSpacing: '-0.02em'
            }}
          >
            NGLP
          </Link>
          <span style={{ color: 'var(--border)', fontSize: '1.2rem' }}>|</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {course.title}
          </span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Active Lesson: <span style={{ color: 'var(--primary)' }}>{activeLesson?.title}</span>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div style={{ display: 'flex', minHeight: '0', flex: '1 1 auto' }}>
        
        {/* Left Sidebar - Course Outline */}
        {showLessons && (
          <aside 
            style={{
              width: '260px',
              backgroundColor: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              flex: '0 0 auto',
              animation: 'slideIn 0.2s ease'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg)'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Lessons Checklist
              </span>
              <button 
                onClick={() => setShowLessons(false)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700' }}
              >
                Hide
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
              {lessons.map((lesson, index) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(`/study/${course.id}/lesson/${lesson.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 14px',
                      margin: '2px 0',
                      border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span 
                      style={{ 
                        display: 'grid', 
                        placeItems: 'center', 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                        backgroundColor: isActive ? 'white' : 'var(--surface-raised)',
                        border: isActive ? '1px solid var(--primary-border)' : '1px solid var(--border)'
                      }}
                    >
                      {index + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong 
                        style={{ 
                          display: 'block', 
                          fontSize: '0.85rem', 
                          fontWeight: '700', 
                          color: isActive ? 'var(--primary)' : 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {lesson.title}
                      </strong>
                      <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {lesson.duration}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Center Main Stage (Video Player & Details) */}
        <main 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0,
            overflowY: 'auto',
            padding: '20px',
            gap: '20px'
          }}
        >
          {/* Video Stage Frame */}
          <section 
            className="premium-card"
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              aspectRatio: '16/9',
              maxHeight: '62vh',
              position: 'relative'
            }}
          >
            {activeLesson.videoUrl ? (
              <video 
                src={resolveMediaUrl(activeLesson.videoUrl)} 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '100%', 
                  height: '100%',
                  gap: '12px',
                  color: 'white'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: '1.4rem' }}>🎬</span>
                </div>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>No Video Uploaded</strong>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{activeLesson.title}</p>
              </div>
            )}
          </section>

          {/* Details & Transcript Tab */}
          {showDetails && (
            <section 
              className="premium-card"
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
                <p style={{ margin: '0 0 4px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lesson Details
                </p>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                  {activeLesson.title}
                </h1>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  {activeLesson.description}
                </p>
              </div>
              
              <details open style={{ cursor: 'pointer' }}>
                <summary 
                  style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '700', 
                    color: 'var(--text-main)', 
                    marginBottom: '10px',
                    outline: 'none'
                  }}
                >
                  Transcription Feed
                </summary>
                <div 
                  style={{ 
                    backgroundColor: 'var(--bg)', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border)',
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: '1.7',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {activeLesson.transcript || 'No transcript generated yet. Upload a video to trigger automated transcription.'}
                </div>
              </details>
            </section>
          )}
        </main>

        {/* Right Sidebar - AI Tutor Chat */}
        {showTutor && (
          <aside 
            style={{
              width: '320px',
              backgroundColor: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              flex: '0 0 auto',
              animation: 'slideIn 0.2s ease',
              zIndex: 5
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg)'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                AI Study Tutor
              </span>
              <button 
                onClick={() => setShowTutor(false)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700' }}
              >
                Hide
              </button>
            </div>
            
            {/* Chat Bubble Window */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '18px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px' 
              }}
            >
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAssistant ? 'flex-start' : 'flex-end',
                      width: '100%'
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '600', 
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                        padding: '0 4px'
                      }}
                    >
                      {isAssistant ? 'AI Tutor' : 'You'}
                    </span>
                    <div 
                      style={{
                        padding: '12px 14px',
                        borderRadius: isAssistant ? '0 12px 12px 12px' : '12px 0 12px 12px',
                        fontSize: '0.88rem',
                        lineHeight: '1.4',
                        maxWidth: '85%',
                        color: isAssistant ? 'var(--text-main)' : 'white',
                        backgroundColor: isAssistant ? 'var(--primary-soft)' : 'var(--primary)',
                        border: isAssistant ? '1px solid var(--primary-border)' : 'none',
                        boxShadow: 'var(--shadow-sm)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form 
              onSubmit={sendMessage}
              style={{ 
                padding: '14px', 
                borderTop: '1px solid var(--border)', 
                display: 'flex', 
                gap: '8px',
                backgroundColor: 'var(--bg)'
              }}
            >
              <input 
                value={chatMessage} 
                onChange={(event) => setChatMessage(event.target.value)} 
                placeholder={isSending ? "AI is typing..." : "Ask the AI tutor..."}
                disabled={isSending}
                style={{
                  flex: 1,
                  minHeight: '38px',
                  padding: '0 12px',
                  fontSize: '0.88rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-main)',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button 
                type="submit"
                disabled={isSending || !chatMessage.trim()}
                style={{
                  minWidth: '60px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: (isSending || !chatMessage.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isSending || !chatMessage.trim()) ? 0.6 : 1,
                  transition: 'all var(--transition-fast)'
                }}
              >
                Send
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '36px',
          padding: '0 16px',
          backgroundColor: 'var(--surface-raised)',
          borderTop: '1px solid var(--border)',
          flex: '0 0 auto',
          zIndex: 10
        }}
      >
        <button 
          onClick={() => setShowLessons(!showLessons)}
          style={{
            minHeight: '24px',
            padding: '0 8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: showLessons ? 'var(--primary-soft)' : 'var(--surface)',
            color: showLessons ? 'var(--primary)' : 'var(--text-main)',
            borderColor: showLessons ? 'var(--primary-border)' : 'var(--border)'
          }}
        >
          Outline Panel
        </button>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{
            minHeight: '24px',
            padding: '0 8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: showDetails ? 'var(--primary-soft)' : 'var(--surface)',
            color: showDetails ? 'var(--primary)' : 'var(--text-main)',
            borderColor: showDetails ? 'var(--primary-border)' : 'var(--border)'
          }}
        >
          Details Panel
        </button>
        <button 
          onClick={() => setShowTutor(!showTutor)}
          style={{
            minHeight: '24px',
            padding: '0 8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: showTutor ? 'var(--primary-soft)' : 'var(--surface)',
            color: showTutor ? 'var(--primary)' : 'var(--text-main)',
            borderColor: showTutor ? 'var(--primary-border)' : 'var(--border)'
          }}
        >
          Tutor Panel
        </button>
      </footer>
    </div>
  );
}
