import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getCurrentUserId } from '../services/api';
import PageFrame from '../components/ui/PageFrame';
import ProgressBar from '../components/ui/ProgressBar';
import { courses as defaultCourses, lessonsByCourse, normalizeCourse, normalizeLesson } from '../utils/constants';

export default function CourseDetails() {
  const { id } = useParams();
  const fallbackCourse = useMemo(() => defaultCourses.find((item) => String(item.id) === id) || defaultCourses[0], [id]);
  
  const [course, setCourse] = useState(fallbackCourse);
  const [lessons, setLessons] = useState(lessonsByCourse[fallbackCourse.id] || []);
  const [enrollStatus, setEnrollStatus] = useState('idle'); // idle, saving, enrolled, offline
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseDetails() {
      try {
        setLoading(true);
        const [courseResponse, lessonsResponse] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/lessons', { params: { courseId: id } }),
        ]);
        if (isMounted) {
          setCourse(normalizeCourse(courseResponse.data));
          setLessons(lessonsResponse.data.map((lesson) => normalizeLesson(lesson)));
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load course details from backend. Using local defaults.', err);
        if (isMounted) {
          setCourse(fallbackCourse);
          setLessons(lessonsByCourse[fallbackCourse.id] || []);
          setLoading(false);
        }
      }
    }

    loadCourseDetails();
    return () => {
      isMounted = false;
    };
  }, [fallbackCourse, id]);

  const startLesson = lessons[0];

  async function enrollInCourse() {
    setEnrollStatus('saving');
    try {
      await api.post('/enrollments', {
        userId: getCurrentUserId(),
        courseId: course.id,
      });
      setEnrollStatus('enrolled');
    } catch (err) {
      console.warn('Enrollment API request failed. Setting offline enrollment mock.', err);
      setEnrollStatus('offline');
    }
  }

  return (
    <PageFrame
      eyebrow={course.category}
      title={course.title}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={enrollInCourse} 
            disabled={enrollStatus === 'saving' || enrollStatus === 'enrolled'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40px',
              padding: '0 18px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: (enrollStatus === 'saving' || enrollStatus === 'enrolled') ? 'not-allowed' : 'pointer',
              backgroundColor: enrollStatus === 'enrolled' ? 'var(--success-soft)' : 'var(--surface)',
              color: enrollStatus === 'enrolled' ? 'var(--success)' : 'var(--text-main)',
              borderColor: enrollStatus === 'enrolled' ? 'var(--success-border)' : 'var(--border)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {enrollStatus === 'enrolled' ? '✓ Enrolled' : enrollStatus === 'saving' ? 'Enrolling...' : 'Enroll Course'}
          </button>
          {startLesson ? (
            <Link 
              className="primary-button" 
              to={`/study/${course.id}/lesson/${startLesson.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px',
                padding: '0 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                fontWeight: '700',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Start Learning
            </Link>
          ) : (
            <Link 
              className="secondary-button" 
              to="/teacher/course-builder"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px',
                padding: '0 18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.88rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-main)'
              }}
            >
              Add Lessons
            </Link>
          )}
        </div>
      }
    >
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '30px',
          alignItems: 'start'
        }}
      >
        {/* Left Syllabus Course Details Description Card */}
        <div 
          className="premium-card"
          style={{
            backgroundColor: 'var(--surface)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
            Course Description
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
            {course.description}
          </p>
          <div style={{ marginTop: '10px' }}>
            <ProgressBar value={course.progress} />
          </div>
        </div>

        {/* Right Syllabus Lesson Outline List Card */}
        <div 
          className="premium-card"
          style={{
            backgroundColor: 'var(--surface)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginBottom: '20px' }}>
            Syllabus Curriculum
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ height: '56px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span>📝</span>
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>No lessons have been published for this course yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lessons.map((lesson, index) => (
                <Link 
                  className="lesson-row" 
                  key={lesson.id} 
                  to={`/study/${course.id}/lesson/${lesson.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-border)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {lesson.title}
                    </strong>
                  </div>
                  <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {lesson.duration}
                  </small>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
