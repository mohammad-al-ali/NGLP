import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageFrame from '../components/ui/PageFrame';
import CourseGrid from '../components/CourseGrid';
import { categories as defaultCategories, courses as defaultCourses, categoryMatches, normalizeCategory, normalizeCourse } from '../utils/constants';

export default function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogState, setCatalogState] = useState({
    categories: defaultCategories,
    courses: defaultCourses,
    loading: true,
    source: 'sample'
  });
  
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const rootResponse = await api.get('/categories/root');
        const rootCategories = rootResponse.data.map((category) => normalizeCategory(category));
        
        const childResponses = await Promise.all(
          rootCategories.map((category) => api.get(`/categories/${category.id}/sub`).catch(() => ({ data: [] })))
        );
        const childCategories = childResponses.flatMap((response, index) =>
          response.data.map((category) => normalizeCategory(category, rootCategories[index].id))
        );
        
        const courseResponse = await api.get('/courses');
        const liveCategories = [...rootCategories, ...childCategories];
        const liveCourses = courseResponse.data.map(normalizeCourse);

        if (isMounted) {
          setCatalogState({
            categories: liveCategories.length > 0 ? liveCategories : defaultCategories,
            courses: liveCourses.length > 0 ? liveCourses : defaultCourses,
            loading: false,
            source: 'backend',
          });
        }
      } catch (err) {
        console.warn('Failed to load live catalog in catalog page. Using sample data.', err);
        if (isMounted) {
          setCatalogState({
            categories: defaultCategories,
            courses: defaultCourses,
            loading: false,
            source: 'sample'
          });
        }
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter courses by selected category
  const filteredCourses = catalogState.courses.filter((course) => 
    categoryMatches(course, selectedCategory, catalogState.categories)
  );

  return (
    <PageFrame 
      eyebrow="Course catalog" 
      title="Browse courses" 
      actions={
        catalogState.source === 'sample' ? (
          <span 
            className="data-source"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '26px',
              padding: '0 10px',
              color: '#92400e',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}
          >
            Sample Data Mode
          </span>
        ) : null
      }
    >
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '240px minmax(0, 1fr)', 
          gap: '30px',
          alignItems: 'start'
        }}
      >
        {/* Left Side Category Filters Panel */}
        <aside 
          style={{ 
            position: 'sticky', 
            top: '100px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
          }}
        >
          <button 
            onClick={() => {
              setSelectedCategory('all');
              setSearchParams({});
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              minHeight: '40px',
              padding: '0 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.88rem',
              backgroundColor: selectedCategory === 'all' ? 'var(--primary-soft)' : 'var(--surface)',
              color: selectedCategory === 'all' ? 'var(--primary)' : 'var(--text-main)',
              borderColor: selectedCategory === 'all' ? 'var(--primary-border)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'left'
            }}
          >
            All Courses
          </button>
          
          {catalogState.categories.map((category) => {
            const isSelected = selectedCategory === String(category.id);
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(String(category.id));
                  setSearchParams({ category: category.id });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '40px',
                  padding: category.parentId ? '0 16px 0 28px' : '0 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  borderColor: isSelected ? 'var(--primary-border)' : 'var(--border)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left'
                }}
              >
                {category.parentId ? `↳ ${category.name}` : category.name}
              </button>
            );
          })}
        </aside>

        {/* Right Side Course Grid list */}
        <div>
          {catalogState.loading ? (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {[1, 2, 3].map((n) => (
                <div className="premium-card animate-pulse" key={n} style={{ height: '300px', backgroundColor: 'var(--surface)' }} />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '2rem' }}>📂</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '12px', color: 'var(--text-main)' }}>No courses found</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>There are no courses listed under this category yet.</p>
            </div>
          ) : (
            <CourseGrid coursesToShow={filteredCourses} />
          )}
        </div>
      </div>
    </PageFrame>
  );
}
