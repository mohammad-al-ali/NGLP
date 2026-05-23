import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getCurrentUserId } from '../../services/api';
import PageFrame from '../../components/ui/PageFrame';
import ProgressBar from '../../components/ui/ProgressBar';
import { courses as defaultCourses, lessonsByCourse, normalizeEnrollment, enrolledCourseIds } from '../../utils/constants';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get('/enrollments', { params: { userId: getCurrentUserId() } })
      .then((response) => {
        if (isMounted) {
          setEnrollments(response.data.map(normalizeEnrollment));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load enrollments from backend. Falling back to local data.', err);
        if (isMounted) {
          setEnrollments([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute courses to show
  const enrolledCourses = enrollments.map((enrollment) => ({
    ...enrollment.course,
    progress: enrollment.progress
  }));
  
  const fallbackCourses = defaultCourses
    .filter((course) => enrolledCourseIds.includes(course.id))
    .slice(0, 3);
    
  const visibleCourses = enrolledCourses.length > 0 ? enrolledCourses : fallbackCourses;
  
  const continueEnrollment = enrollments.find((e) => e.lastWatchedLesson) || enrollments[0];
  const continueCourse = continueEnrollment?.course || visibleCourses[0] || defaultCourses[0];
  const continueLesson = continueEnrollment?.lastWatchedLesson || 
    lessonsByCourse[continueCourse?.id]?.[0] || 
    lessonsByCourse[1][0];

  return (
    <PageFrame 
      eyebrow="Student workspace" 
      title="Dashboard" 
      actions={
        <Link 
          className="secondary-button" 
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '38px',
            padding: '0 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.85rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-main)',
            transition: 'all var(--transition-fast)'
          }}
        >
          Edit Profile
        </Link>
      }
    >
      {/* Resume Course Header Row */}
      {continueLesson && (
        <section 
          className="premium-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            marginBottom: '32px',
            padding: '30px',
            backgroundColor: 'var(--primary-soft)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-lg)',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Continue Learning
            </p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              {continueLesson.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              {continueCourse?.title}
            </p>
          </div>
          <Link 
            className="primary-button" 
            to={`/study/${continueCourse?.id || 1}/lesson/${continueLesson.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              padding: '0 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            Resume Lesson
          </Link>
        </section>
      )}

      {/* Enrollments Grid */}
      <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
        Your Enrolled Courses ({visibleCourses.length})
      </h3>
      
      {loading ? (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {[1, 2, 3].map((n) => (
            <div className="premium-card animate-pulse" key={n} style={{ height: '220px', backgroundColor: 'var(--surface)' }} />
          ))}
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gap: '24px', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' 
          }}
        >
          {visibleCourses.map((course) => (
            <article 
              className="premium-card" 
              key={course.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                padding: '24px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div>
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '22px',
                    padding: '0 10px',
                    color: 'var(--primary)',
                    backgroundColor: 'var(--primary-soft)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    marginBottom: '14px'
                  }}
                >
                  {course.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              </div>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <ProgressBar value={course.progress} />
                </div>
                <Link 
                  className="text-link" 
                  to={`/course/${course.id}`}
                  style={{ 
                    color: 'var(--primary)', 
                    fontWeight: '700', 
                    fontSize: '0.9rem' 
                  }}
                >
                  View syllabus &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
