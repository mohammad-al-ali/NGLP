import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import './App.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
});

const CURRENT_USER_KEY = 'nglp.currentUser';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

function saveStoredUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUserId() {
  return getStoredUser()?.id || 1;
}

const categories = [
  { id: 1, name: 'Programming', parentId: null },
  { id: 2, name: 'Design', parentId: null },
  { id: 3, name: 'Data Science', parentId: null },
  { id: 4, name: 'Frontend', parentId: 1 },
  { id: 5, name: 'Backend', parentId: 1 },
  { id: 6, name: 'Product Design', parentId: 2 },
];

const courses = [
  {
    id: 1,
    title: 'React Foundations with AI Tutor',
    categoryId: 4,
    category: 'Frontend',
    level: 'Beginner',
    progress: 72,
    students: 1240,
    lessonsCount: 4,
    description:
      'Build confident React habits through concise lessons, guided examples, and contextual AI help while you study.',
  },
  {
    id: 2,
    title: 'Spring Boot API Builder',
    categoryId: 5,
    category: 'Backend',
    level: 'Intermediate',
    progress: 38,
    students: 840,
    lessonsCount: 3,
    description:
      'Design REST endpoints, model relationships, and connect uploads to long-running services in a practical backend flow.',
  },
  {
    id: 3,
    title: 'UX Systems for Learning Products',
    categoryId: 6,
    category: 'Product Design',
    level: 'All levels',
    progress: 12,
    students: 650,
    lessonsCount: 3,
    description:
      'Create clear navigation, course flows, and study interfaces for focused digital learning experiences.',
  },
  {
    id: 4,
    title: 'Python Data Workflows',
    categoryId: 3,
    category: 'Data Science',
    level: 'Beginner',
    progress: 0,
    students: 970,
    lessonsCount: 3,
    description:
      'Learn practical notebooks, data cleaning, and explanation-first analysis with tutor prompts at each step.',
  },
];

const lessonsByCourse = {
  1: [
    {
      id: 101,
      title: 'React mental model',
      duration: '09:42',
      description: 'Understand components, props, state, and how React updates UI predictably.',
      transcript:
        'React applications are built as a tree of components. Each component receives inputs and returns interface. State changes tell React which part of the tree needs a fresh render.',
      videoUrl: '',
    },
    {
      id: 102,
      title: 'State and events',
      duration: '12:10',
      description: 'Practice controlled state, event handlers, and simple interactive widgets.',
      transcript:
        'Events carry user intent into your component. State stores the current answer your interface should show.',
      videoUrl: '',
    },
    {
      id: 103,
      title: 'Routing pages',
      duration: '10:28',
      description: 'Use routes, links, and URL parameters to shape a multi-screen learning app.',
      transcript:
        'A route maps a URL to a component. Parameters let one component serve many records, such as course details by id.',
      videoUrl: '',
    },
    {
      id: 104,
      title: 'Calling APIs',
      duration: '14:34',
      description: 'Fetch backend data, handle loading states, and keep the UI useful when requests fail.',
      transcript:
        'API calls should have a loading path, a success path, and a recovery path. This keeps the learning flow steady.',
      videoUrl: '',
    },
  ],
  2: [
    {
      id: 201,
      title: 'Controller design',
      duration: '11:22',
      description: 'Create resource controllers and readable endpoint contracts.',
      transcript: 'Controllers describe the public surface of an API. Keep routes consistent and responses predictable.',
      videoUrl: '',
    },
    {
      id: 202,
      title: 'Multipart lessons',
      duration: '13:18',
      description: 'Upload lesson metadata and video files in a single multipart request.',
      transcript: 'Multipart upload lets a client send structured JSON and a binary file together in one request.',
      videoUrl: '',
    },
    {
      id: 203,
      title: 'Async transcripts',
      duration: '08:55',
      description: 'Let video processing continue after the upload succeeds.',
      transcript: 'Long-running transcription work should happen outside the request path so users can keep working.',
      videoUrl: '',
    },
  ],
  3: [
    {
      id: 301,
      title: 'Learning journeys',
      duration: '10:10',
      description: 'Map user goals to course, lesson, and study room navigation.',
      transcript: 'Good learning products make the next useful action obvious without crowding the page.',
      videoUrl: '',
    },
    {
      id: 302,
      title: 'Study interface patterns',
      duration: '12:47',
      description: 'Balance video, notes, lesson context, and AI support in a focused workspace.',
      transcript: 'The study room should privilege learning content while keeping support controls close at hand.',
      videoUrl: '',
    },
    {
      id: 303,
      title: 'Progress feedback',
      duration: '07:51',
      description: 'Use progress bars and status text to orient learners.',
      transcript: 'Progress feedback works best when it tells the learner where they are and what can happen next.',
      videoUrl: '',
    },
  ],
  4: [
    {
      id: 401,
      title: 'Notebook setup',
      duration: '08:35',
      description: 'Prepare a lightweight data workspace and load the first dataset.',
      transcript: 'A reproducible notebook starts with clear imports, a known dataset, and small verifiable steps.',
      videoUrl: '',
    },
    {
      id: 402,
      title: 'Clean and inspect',
      duration: '13:05',
      description: 'Find missing values, normalize columns, and keep transformations explainable.',
      transcript: 'Inspection turns raw data into a set of concrete questions. Cleaning makes those questions answerable.',
      videoUrl: '',
    },
    {
      id: 403,
      title: 'Explain the result',
      duration: '09:14',
      description: 'Turn outputs into concise findings supported by the data.',
      transcript: 'A useful analysis connects a result to a decision. The best chart is the one that clarifies that link.',
      videoUrl: '',
    },
  ],
};

const enrolledCourseIds = [1, 2, 3];

function categoryMatches(course, selectedCategoryId, categoryList = categories) {
  if (selectedCategoryId === 'all') return true;
  const targetId = Number(selectedCategoryId);
  const courseCategory = categoryList.find((category) => category.id === course.categoryId);
  return course.categoryId === targetId || courseCategory?.parentId === targetId;
}

function normalizeCategory(category, parentId = null) {
  return {
    id: category.id,
    name: category.name,
    parentId,
  };
}

function normalizeCourse(course) {
  const fallback = courses.find((item) => item.id === course.id);
  return {
    id: course.id,
    title: course.title || fallback?.title || 'Untitled course',
    categoryId: course.category?.id || fallback?.categoryId || null,
    category: course.category?.name || fallback?.category || 'Uncategorized',
    level: fallback?.level || 'All levels',
    progress: fallback?.progress || 0,
    students: fallback?.students || 0,
    lessonsCount: fallback?.lessonsCount || 0,
    description: course.description || fallback?.description || 'No description has been added yet.',
  };
}

function normalizeLesson(lesson) {
  const fallback = Object.values(lessonsByCourse)
    .flat()
    .find((item) => item.id === lesson.id);
  return {
    id: lesson.id,
    title: lesson.title || fallback?.title || 'Untitled lesson',
    duration: lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : fallback?.duration || '00:00',
    durationSeconds: lesson.durationSeconds || 0,
    description: fallback?.description || 'Lesson details will appear here when the backend provides lesson descriptions.',
    transcript: lesson.transcript || fallback?.transcript || 'Transcript will appear here after processing finishes.',
    videoUrl: lesson.videoUrl || fallback?.videoUrl || '',
  };
}

function normalizeEnrollment(enrollment) {
  const course = normalizeCourse(enrollment.course || {});
  return {
    id: enrollment.id,
    course,
    progress: enrollment.progressPercentage || 0,
    lastWatchedLesson: enrollment.lastWatchedLesson ? normalizeLesson(enrollment.lastWatchedLesson) : null,
  };
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${api.defaults.baseURL.replace('/api/v1', '')}${url}`;
}

function useCatalogData() {
  const [state, setState] = useState({ categories, courses, loading: true, source: 'sample' });

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
          setState({
            categories: liveCategories.length > 0 ? liveCategories : categories,
            courses: liveCourses.length > 0 ? liveCourses : courses,
            loading: false,
            source: 'backend',
          });
        }
      } catch {
        if (isMounted) setState({ categories, courses, loading: false, source: 'sample' });
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/teacher" element={<TeacherOverview />} />
          <Route path="/teacher/course-builder" element={<CourseBuilder />} />
          <Route path="/admin/categories" element={<CategoriesManager />} />
          <Route path="/admin/users" element={<UsersManagement />} />
        </Route>
        <Route path="/study/:courseId/lesson/:lessonId" element={<StudyRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">
          <span className="brand-mark">N</span>
          <span>NGLP</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/catalog">Catalog</NavLink>
          <NavLink to="/dashboard">Student</NavLink>
          <NavLink to="/teacher">Teacher</NavLink>
          <NavLink to="/admin/categories">Admin</NavLink>
        </nav>
        <div className="nav-actions">
          <Link className="ghost-button" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/register">
            Register
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function LandingPage() {
  const { categories: catalogCategories, courses: catalogCourses, source } = useCatalogData();
  const topCourses = catalogCourses.slice(0, 3);

  return (
    <>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">AI-driven learning platform</p>
          <h1>NGLP</h1>
          <p>
            A focused learning workspace where courses, video lessons, transcripts, and an AI tutor stay connected in one clear flow.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/catalog">
              Browse Courses
            </Link>
            <Link className="secondary-button" to="/dashboard">
              Continue Learning
            </Link>
          </div>
        </div>
        <div className="learning-preview" aria-label="Learning workspace preview">
          <div className="preview-sidebar">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-main">
            <div className="preview-video" />
            <div className="preview-detail" />
          </div>
          <div className="preview-chat">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Explore by focus</p>
          <h2>Available Categories</h2>
          {source === 'sample' && <span className="data-source">Sample data</span>}
        </div>
        <div className="category-grid">
          {catalogCategories
            .filter((category) => !category.parentId)
            .map((category) => (
              <Link className="category-tile" key={category.id} to={`/catalog?category=${category.id}`}>
                <span>{category.name}</span>
                <small>{catalogCourses.filter((course) => categoryMatches(course, category.id, catalogCategories)).length} courses</small>
              </Link>
            ))}
        </div>
      </section>

      <section className="content-section section-band">
        <div className="section-heading">
          <p className="eyebrow">Popular paths</p>
          <h2>Top Courses</h2>
        </div>
        <CourseGrid coursesToShow={topCourses} />
      </section>
    </>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  function submitForm(event) {
    event.preventDefault();
    const nextErrors = validateAuth(form, false);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    api.post('/auth/login', form)
      .then((response) => {
        saveStoredUser(response.data.user);
        navigate('/dashboard');
      })
      .catch(() => setErrors({ password: 'Invalid email or password, or the backend is unavailable.' }));
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to continue your courses and AI tutor sessions.">
      <form className="form-stack" onSubmit={submitForm} noValidate>
        <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(email) => setForm({ ...form, email })} />
        <TextField label="Password" type="password" value={form.password} error={errors.password} onChange={(password) => setForm({ ...form, password })} />
        <button className="primary-button full-width" type="submit">
          Login
        </button>
      </form>
    </AuthFrame>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', roleId: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let isMounted = true;

    async function loadRoles() {
      try {
        const response = await api.get('/roles');
        const studentTeacherRoles = response.data.filter((role) => /STUDENT|TEACHER/i.test(role.name));
        if (isMounted) {
          setRoles(studentTeacherRoles);
          setForm((current) => ({ ...current, roleId: String(studentTeacherRoles[0]?.id || '') }));
        }
      } catch {
        if (isMounted) setRoles([]);
      }
    }

    loadRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submitForm(event) {
    event.preventDefault();
    const nextErrors = validateAuth(form, true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    try {
      await api.post('/users/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.roleId ? { id: Number(form.roleId) } : undefined,
      }).then((response) => saveStoredUser(response.data));
      navigate('/dashboard');
    } catch {
      setStatus('offline');
      navigate('/dashboard');
    }
  }

  return (
    <AuthFrame title="Create your account" subtitle="Register as a student or teacher and start building a learning path.">
      <form className="form-stack" onSubmit={submitForm} noValidate>
        <TextField label="Full name" value={form.fullName} error={errors.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
        <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(email) => setForm({ ...form, email })} />
        <TextField label="Password" type="password" value={form.password} error={errors.password} onChange={(password) => setForm({ ...form, password })} />
        <TextField label="Confirm password" type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} />
        <label className="field-label">
          Role
          {roles.length > 0 ? (
            <select value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value })}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name.replace('ROLE_', '')}</option>
              ))}
            </select>
          ) : (
            <select value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value })}>
              <option value="">Student</option>
              <option value="">Teacher</option>
            </select>
          )}
        </label>
        {status === 'offline' && <p className="form-note">Backend unavailable, so the demo continues locally.</p>}
        <button className="primary-button full-width" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }) {
  return (
    <section className="auth-layout">
      <div className="auth-panel">
        <p className="eyebrow">Account access</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

function validateAuth(form, isRegister) {
  const nextErrors = {};
  if (isRegister && !form.fullName.trim()) nextErrors.fullName = 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
  if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
  if (isRegister && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords must match.';
  return nextErrors;
}

function TextField({ label, value, onChange, type = 'text', error }) {
  return (
    <label className="field-label">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function StudentDashboard() {
  const { courses: catalogCourses } = useCatalogData();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.get('/enrollments', { params: { userId: getCurrentUserId() } })
      .then((response) => {
        if (isMounted) setEnrollments(response.data.map(normalizeEnrollment));
      })
      .catch(() => {
        if (isMounted) setEnrollments([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const enrolledCourses = enrollments.map((enrollment) => ({ ...enrollment.course, progress: enrollment.progress }));
  const fallbackCourses = catalogCourses.filter((course) => enrolledCourseIds.includes(course.id)).slice(0, 3);
  const visibleCourses = enrolledCourses.length > 0 ? enrolledCourses : fallbackCourses;
  const continueEnrollment = enrollments.find((enrollment) => enrollment.lastWatchedLesson) || enrollments[0];
  const continueCourse = continueEnrollment?.course || visibleCourses[0] || courses[0];
  const continueLesson = continueEnrollment?.lastWatchedLesson || lessonsByCourse[continueCourse?.id]?.[1] || lessonsByCourse[continueCourse?.id]?.[0] || lessonsByCourse[1][0];

  return (
    <PageFrame eyebrow="Student workspace" title="Dashboard" actions={<Link className="secondary-button" to="/profile">Edit Profile</Link>}>
      <section className="continue-panel">
        <div>
          <p className="eyebrow">Continue Learning</p>
          <h2>{continueLesson.title}</h2>
          <p>{continueCourse.title}</p>
        </div>
        <Link className="primary-button" to={`/study/${continueCourse.id}/lesson/${continueLesson.id}`}>
          Resume Lesson
        </Link>
      </section>
      <div className="dashboard-grid">
        {visibleCourses.map((course) => (
          <article className="course-card" key={course.id}>
            <div>
              <span className="pill">{course.category}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
            <ProgressBar value={course.progress} />
            <Link className="text-link" to={`/course/${course.id}`}>View course</Link>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

function CourseCatalog() {
  const [searchParams] = useSearchParams();
  const { categories: catalogCategories, courses: catalogCourses, source } = useCatalogData();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const filteredCourses = catalogCourses.filter((course) => categoryMatches(course, selectedCategory, catalogCategories));

  return (
    <PageFrame eyebrow="Course catalog" title="Browse courses" actions={source === 'sample' ? <span className="data-source">Sample data</span> : null}>
      <div className="catalog-layout">
        <aside className="filter-panel">
          <button className={selectedCategory === 'all' ? 'filter-button active' : 'filter-button'} onClick={() => setSelectedCategory('all')}>
            All courses
          </button>
          {catalogCategories.map((category) => (
            <button
              className={selectedCategory === String(category.id) ? 'filter-button active' : 'filter-button'}
              key={category.id}
              onClick={() => setSelectedCategory(String(category.id))}
            >
              {category.parentId ? `- ${category.name}` : category.name}
            </button>
          ))}
        </aside>
        <CourseGrid coursesToShow={filteredCourses} />
      </div>
    </PageFrame>
  );
}

function CourseGrid({ coursesToShow }) {
  return (
    <div className="course-grid">
      {coursesToShow.map((course) => (
        <article className="course-card" key={course.id}>
          <div className="course-meta">
            <span className="pill">{course.category}</span>
            <span>{course.level}</span>
          </div>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <div className="course-stats">
            <span>{course.lessonsCount} lessons</span>
            <span>{course.students.toLocaleString()} learners</span>
          </div>
          <Link className="secondary-button" to={`/course/${course.id}`}>
            View Details
          </Link>
        </article>
      ))}
    </div>
  );
}

function CourseDetails() {
  const { id } = useParams();
  const fallbackCourse = useMemo(() => courses.find((item) => String(item.id) === id) || courses[0], [id]);
  const [course, setCourse] = useState(fallbackCourse);
  const [lessons, setLessons] = useState(lessonsByCourse[fallbackCourse.id] || []);
  const [enrollStatus, setEnrollStatus] = useState('idle');

  useEffect(() => {
    let isMounted = true;

    async function loadCourseDetails() {
      try {
        const [courseResponse, lessonsResponse] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/lessons', { params: { courseId: id } }),
        ]);
        if (isMounted) {
          setCourse(normalizeCourse(courseResponse.data));
          const normalizedLessons = await Promise.all(lessonsResponse.data.map(async (lesson) => {
            const normalized = normalizeLesson(lesson);
            try {
              const transcriptResponse = await api.get('/transcripts', { params: { lessonId: normalized.id } });
              return {
                ...normalized,
                transcript: transcriptResponse.data.map((item) => item.transcriptContent).join('\n\n') || normalized.transcript,
              };
            } catch {
              return normalized;
            }
          }));
          setLessons(normalizedLessons);
        }
      } catch {
        if (isMounted) {
          setCourse(fallbackCourse);
          setLessons(lessonsByCourse[fallbackCourse.id] || []);
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
      await api.post('/enrollments', null, { params: { userId: getCurrentUserId(), courseId: course.id } });
      setEnrollStatus('enrolled');
    } catch {
      setEnrollStatus('offline');
    }
  }

  return (
    <PageFrame
      eyebrow={course.category}
      title={course.title}
      actions={<>
        <button className="secondary-button" type="button" onClick={enrollInCourse} disabled={enrollStatus === 'saving'}>
          {enrollStatus === 'enrolled' ? 'Enrolled' : 'Enroll'}
        </button>
        {startLesson ? (
          <Link className="primary-button" to={`/study/${course.id}/lesson/${startLesson.id}`}>Start Learning</Link>
        ) : (
          <Link className="secondary-button" to="/teacher/course-builder">Add Lessons</Link>
        )}
      </>}
    >
      <section className="details-layout">
        <div className="details-copy">
          <h2>Course Description</h2>
          <p>{course.description}</p>
          <ProgressBar value={course.progress} />
        </div>
        <div className="lesson-outline">
          <h2>Lessons</h2>
          {lessons.map((lesson, index) => (
            <Link className="lesson-row" key={lesson.id} to={`/study/${course.id}/lesson/${lesson.id}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{lesson.title}</strong>
              <small>{lesson.duration}</small>
            </Link>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function StudyRoom() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const fallbackCourse = useMemo(() => courses.find((item) => String(item.id) === courseId) || courses[0], [courseId]);
  const [course, setCourse] = useState(fallbackCourse);
  const [lessons, setLessons] = useState(lessonsByCourse[fallbackCourse.id] || lessonsByCourse[1]);
  const activeLesson = lessons.find((lesson) => String(lesson.id) === lessonId) || lessons[0] || lessonsByCourse[1][0];
  const [showLessons, setShowLessons] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showTutor, setShowTutor] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about this lesson, the transcript, or what to review next.' },
  ]);

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
      } catch {
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

  async function sendMessage(event) {
    event.preventDefault();
    if (!chatMessage.trim()) return;
    const studentMessage = { role: 'student', text: chatMessage.trim() };
    setMessages((current) => [...current, studentMessage]);
    setChatMessage('');
    try {
      const response = await api.post('/ai/messages', {
        userId: getCurrentUserId(),
        lessonId: activeLesson.id,
        timestamp: 0,
        message: studentMessage.text,
      });
      setMessages((current) => [...current, { role: 'assistant', text: response.data.response }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: `Offline tutor note: review "${activeLesson.title}" and compare it with the transcript summary below.` },
      ]);
    }
  }

  return (
    <div className="study-room">
      <div className="study-topbar">
        <Link to="/dashboard" className="study-brand">NGLP</Link>
        <span>{course.title}</span>
      </div>
      <div className="study-body">
        {showLessons && (
          <aside className="study-sidebar study-sidebar-left">
            <div className="panel-heading">
              <span>Lessons</span>
              <button onClick={() => setShowLessons(false)} aria-label="Hide lessons">Hide</button>
            </div>
            <div className="study-lessons">
              {lessons.map((lesson, index) => (
                <button
                  className={lesson.id === activeLesson.id ? 'study-lesson active' : 'study-lesson'}
                  key={lesson.id}
                  onClick={() => navigate(`/study/${course.id}/lesson/${lesson.id}`)}
                >
                  <span>{index + 1}</span>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.duration}</small>
                </button>
              ))}
            </div>
          </aside>
        )}

        <main className="study-main">
          <section className="video-stage">
            {activeLesson.videoUrl ? (
              <video src={resolveMediaUrl(activeLesson.videoUrl)} controls />
            ) : (
              <div className="video-placeholder">
                <span>Video Player</span>
                <strong>{activeLesson.title}</strong>
              </div>
            )}
          </section>
          {showDetails && (
            <section className="lesson-details-panel">
              <div>
                <p className="eyebrow">Lesson Details</p>
                <h1>{activeLesson.title}</h1>
                <p>{activeLesson.description}</p>
              </div>
              <details open>
                <summary>Transcript</summary>
                <p>{activeLesson.transcript}</p>
              </details>
            </section>
          )}
        </main>

        {showTutor && (
          <aside className="study-sidebar study-sidebar-right">
            <div className="panel-heading">
              <span>AI Tutor</span>
              <button onClick={() => setShowTutor(false)} aria-label="Hide AI tutor">Hide</button>
            </div>
            <div className="chat-window">
              {messages.map((message, index) => (
                <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Ask the tutor..." />
              <button type="submit">Send</button>
            </form>
          </aside>
        )}
      </div>
      <footer className="study-statusbar">
        <button className={showLessons ? 'toggle-button active' : 'toggle-button'} onClick={() => setShowLessons((value) => !value)}>
          Lessons
        </button>
        <button className={showDetails ? 'toggle-button active' : 'toggle-button'} onClick={() => setShowDetails((value) => !value)}>
          Details
        </button>
        <button className={showTutor ? 'toggle-button active' : 'toggle-button'} onClick={() => setShowTutor((value) => !value)}>
          AI Tutor
        </button>
      </footer>
    </div>
  );
}

function ProfilePage() {
  const storedUser = getStoredUser();
  const [form, setForm] = useState({ fullName: storedUser?.fullName || '', email: storedUser?.email || '', password: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get(`/users/${getCurrentUserId()}`)
      .then((response) => {
        if (isMounted) {
          saveStoredUser(response.data);
          setForm({ fullName: response.data.fullName || '', email: response.data.email || '', password: '' });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  async function submitForm(event) {
    event.preventDefault();
    setSaved(false);
    try {
      const response = await api.put(`/users/${getCurrentUserId()}`, { fullName: form.fullName, email: form.email, password: form.password });
      saveStoredUser(response.data);
    } catch {
      // The local demo still reflects the update when the backend is not running.
    }
    setSaved(true);
  }

  return (
    <PageFrame eyebrow="Account" title="Profile">
      <form className="profile-form" onSubmit={submitForm}>
        <TextField label="Name" value={form.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
        <TextField label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <TextField label="New password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {saved && <p className="form-note">Profile saved.</p>}
        <button className="primary-button" type="submit">Save Changes</button>
      </form>
    </PageFrame>
  );
}

function TeacherOverview() {
  const { courses: catalogCourses } = useCatalogData();
  const [teacherCourses, setTeacherCourses] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.get('/courses', { params: { teacherId: getCurrentUserId() } })
      .then((response) => {
        if (isMounted) setTeacherCourses(response.data.map(normalizeCourse));
      })
      .catch(() => {
        if (isMounted) setTeacherCourses(catalogCourses.slice(0, 3));
      });
    return () => {
      isMounted = false;
    };
  }, [catalogCourses]);

  return (
    <PageFrame eyebrow="Teacher dashboard" title="Course overview" actions={<Link className="primary-button" to="/teacher/course-builder">Create Course</Link>}>
      <div className="stats-grid">
        <StatCard label="Created courses" value={teacherCourses.length} />
        <StatCard label="Published lessons" value={teacherCourses.reduce((total, course) => total + course.lessonsCount, 0)} />
        <StatCard label="Active learners" value="2,730" />
      </div>
      <CourseGrid coursesToShow={teacherCourses} />
    </PageFrame>
  );
}

function CourseBuilder() {
  const { categories: catalogCategories } = useCatalogData();
  const [courseInfo, setCourseInfo] = useState({ title: '', description: '', categoryId: 4 });
  const [savedCourse, setSavedCourse] = useState(null);
  const [courseStatus, setCourseStatus] = useState('idle');
  const [lessonTitle, setLessonTitle] = useState('');
  const [queue, setQueue] = useState([]);

  async function saveCourse() {
    if (!courseInfo.title.trim()) {
      setCourseStatus('missing title');
      return;
    }

    setCourseStatus('saving');
    try {
      const response = await api.post('/courses', {
        title: courseInfo.title,
        description: courseInfo.description,
        category: { id: courseInfo.categoryId },
        teacher: { id: getCurrentUserId() },
      });
      setSavedCourse(normalizeCourse(response.data));
      setCourseStatus('saved');
    } catch {
      setSavedCourse({ id: 1, title: courseInfo.title });
      setCourseStatus('offline draft');
    }
  }

  function handleFiles(fileList) {
    Array.from(fileList)
      .filter((file) => file.type === 'video/mp4' || file.name.endsWith('.mp4'))
      .forEach((file) => uploadLesson(file));
  }

  async function uploadLesson(file) {
    const id = crypto.randomUUID();
    const title = lessonTitle || file.name.replace(/\.mp4$/i, '');
    setQueue((current) => [...current, { id, title, fileName: file.name, progress: 0, status: 'uploading' }]);
    setLessonTitle('');

    const formData = new FormData();
    formData.append(
      'lesson',
      new Blob([JSON.stringify({ title, course: { id: savedCourse?.id || 1 } })], { type: 'application/json' })
    );
    formData.append('file', file);

    try {
      await api.post('/lessons', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setQueue((current) => current.map((item) => (item.id === id ? { ...item, progress } : item)));
        },
      });
      setQueue((current) => current.map((item) => (item.id === id ? { ...item, progress: 100, status: 'processing transcript' } : item)));
    } catch {
      setQueue((current) => current.map((item) => (item.id === id ? { ...item, progress: Math.max(item.progress, 68), status: 'queued locally' } : item)));
    }
  }

  return (
    <PageFrame eyebrow="Unified creation flow" title="Course & Lesson Builder">
      <div className="builder-layout">
        <section className="builder-step">
          <span className="step-label">Step 1</span>
          <h2>Course Info</h2>
          <TextField label="Course Title" value={courseInfo.title} onChange={(title) => setCourseInfo({ ...courseInfo, title })} />
          <label className="field-label">
            Description
            <textarea value={courseInfo.description} onChange={(event) => setCourseInfo({ ...courseInfo, description: event.target.value })} rows="5" />
          </label>
          <label className="field-label">
            Category
            <select value={courseInfo.categoryId} onChange={(event) => setCourseInfo({ ...courseInfo, categoryId: Number(event.target.value) })}>
              {catalogCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={saveCourse} disabled={courseStatus === 'saving'}>
            {courseStatus === 'saving' ? 'Saving Course...' : savedCourse ? 'Update Course Draft' : 'Save Course Info'}
          </button>
          {courseStatus !== 'idle' && <p className="form-note">Course status: {courseStatus}</p>}
        </section>
        <section className="builder-step">
          <span className="step-label">Step 2</span>
          <h2>Lesson Upload Area</h2>
          <TextField label="Lesson Title" value={lessonTitle} onChange={setLessonTitle} />
          <label
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFiles(event.dataTransfer.files);
            }}
          >
            <input type="file" accept="video/mp4,.mp4" multiple onChange={(event) => handleFiles(event.target.files)} />
            <strong>Drop .mp4 lessons here</strong>
            <span>Uploads run in the background so more lessons can be queued.</span>
          </label>
          <div className="upload-queue">
            {queue.map((item) => (
              <div className="upload-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.fileName} - {item.status}</span>
                </div>
                <ProgressBar value={item.progress} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageFrame>
  );
}

function CategoriesManager() {
  const [items, setItems] = useState(categories);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const tree = useMemo(() => buildCategoryTree(items), [items]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const rootResponse = await api.get('/categories/root');
        const rootCategories = rootResponse.data.map((category) => normalizeCategory(category));
        const childResponses = await Promise.all(
          rootCategories.map((category) => api.get(`/categories/${category.id}/sub`).catch(() => ({ data: [] })))
        );
        const childCategories = childResponses.flatMap((response, index) =>
          response.data.map((category) => normalizeCategory(category, rootCategories[index].id))
        );

        if (isMounted && rootCategories.length > 0) {
          setItems([...rootCategories, ...childCategories]);
        }
      } catch {
        if (isMounted) setItems(categories);
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  async function addCategory(event) {
    event.preventDefault();
    if (!name.trim()) return;
    const nextCategory = { id: Date.now(), name: name.trim(), parentId: parentId ? Number(parentId) : null };
    try {
      const response = await api.post('/categories', {
        name: nextCategory.name,
        parent: nextCategory.parentId ? { id: nextCategory.parentId } : null,
      });
      setItems((current) => [...current, normalizeCategory(response.data, nextCategory.parentId)]);
    } catch {
      setItems((current) => [...current, nextCategory]);
    }
    setName('');
    setParentId('');
  }

  async function deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
    } catch {
      // Keep the local manager usable when the API rejects parent deletes or is offline.
    }
    setItems((current) => current.filter((item) => item.id !== id && item.parentId !== id));
  }

  async function renameCategory(category, nextName) {
    try {
      await api.put(`/categories/${category.id}`, {
        name: nextName,
        parent: category.parentId ? { id: category.parentId } : null,
      });
    } catch {
      // The local label still updates so the admin flow can be reviewed without the API.
    }
    setItems((current) => current.map((item) => (item.id === category.id ? { ...item, name: nextName } : item)));
  }

  return (
    <PageFrame eyebrow="Admin panel" title="Categories Manager" actions={<Link className="secondary-button" to="/admin/users">Users Management</Link>}>
      <div className="admin-layout">
        <form className="admin-form" onSubmit={addCategory}>
          <TextField label="Category name" value={name} onChange={setName} />
          <label className="field-label">
            Parent category
            <select value={parentId} onChange={(event) => setParentId(event.target.value)}>
              <option value="">Root category</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit">Create Category</button>
        </form>
        <div className="tree-view">
          {tree.map((category) => (
            <CategoryNode key={category.id} category={category} onDelete={deleteCategory} onRename={renameCategory} />
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

function CategoryNode({ category, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(category.name);

  function saveLabel() {
    onRename(category, label.trim() || category.name);
    setEditing(false);
  }

  return (
    <div className="tree-node">
      <div className="tree-row">
        {editing ? <input value={label} onChange={(event) => setLabel(event.target.value)} /> : <strong>{label}</strong>}
        <button onClick={editing ? saveLabel : () => setEditing(true)}>{editing ? 'Save' : 'Edit'}</button>
        <button onClick={() => onDelete(category.id)}>Delete</button>
      </div>
      {category.children.length > 0 && (
        <div className="tree-children">
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} onDelete={onDelete} onRename={onRename} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildCategoryTree(items) {
  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots = [];
  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId).children.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

function UsersManagement() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([
    { id: 1, fullName: 'Sara Student', email: 'sara@nglp.dev', role: { id: 1, name: 'ROLE_STUDENT' }, blocked: false },
    { id: 2, fullName: 'Tariq Teacher', email: 'tariq@nglp.dev', role: { id: 2, name: 'ROLE_TEACHER' }, blocked: false },
    { id: 3, fullName: 'Admin User', email: 'admin@nglp.dev', role: { id: 3, name: 'ROLE_ADMIN' }, blocked: false },
  ]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.get('/users'), api.get('/roles')])
      .then(([usersResponse, rolesResponse]) => {
        if (isMounted) {
          setUsers(usersResponse.data);
          setRoles(rolesResponse.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  async function updateUser(id, changes) {
    const nextUser = users.find((user) => user.id === id);
    const updatedUser = { ...nextUser, ...changes };
    setUsers((current) => current.map((user) => (user.id === id ? updatedUser : user)));
    try {
      const response = await api.put(`/users/${id}/admin`, {
        role: updatedUser.role,
        blocked: updatedUser.blocked,
      });
      setUsers((current) => current.map((user) => (user.id === id ? response.data : user)));
    } catch {
      // Keep the local table responsive while backend validation is being fixed.
    }
  }

  return (
    <PageFrame eyebrow="Admin panel" title="Users Management" actions={<Link className="secondary-button" to="/admin/categories">Categories</Link>}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role?.id || ''}
                    onChange={(event) => updateUser(user.id, { role: roles.find((role) => String(role.id) === event.target.value) })}
                  >
                    {(roles.length > 0 ? roles : [{ id: 1, name: 'ROLE_STUDENT' }, { id: 2, name: 'ROLE_TEACHER' }, { id: 3, name: 'ROLE_ADMIN' }]).map((role) => (
                      <option key={role.id} value={role.id}>{role.name.replace('ROLE_', '')}</option>
                    ))}
                  </select>
                </td>
                <td>{user.blocked ? 'Blocked' : 'Active'}</td>
                <td>
                  <button className="table-action" onClick={() => updateUser(user.id, { blocked: !user.blocked })}>
                    {user.blocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageFrame>
  );
}

function PageFrame({ eyebrow, title, actions, children }) {
  return (
    <section className="page-frame">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress-block" aria-label={`Progress ${value}%`}>
      <div className="progress-copy">
        <span>Progress</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;