import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LessonList({ currentLessonId, onSelectLesson }) {
  // 1. تعريف حالات المكون
  const [lessons, setLessons] = useState([]); // مصفوفة فارغة في البداية
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. استخدام useEffect لجلب البيانات مرة واحدة عند تحميل الشاشة
  useEffect(() => {
    // تواصل مع Spring Boot لجلب قائمة الدروس
    axios.get('http://localhost:8080/api/lessons')
      .then(response => {
        setLessons(response.data); // حفظ البيانات القادمة من السيرفر
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching lessons:', err);
        setError('فشل في الاتصال بالسيرفر. تأكد من تشغيل Spring Boot.');
        setLoading(false);
      });
  }, []); // المصفوفة الفارغة تعني: "نفذ هذا الكود مرة واحدة فقط عند البداية"

  // 3. ماذا نعرض أثناء التحميل أو عند حدوث خطأ؟
  if (loading) return <div style={{ padding: '15px' }}>⏳ جاري تحميل الدروس...</div>;
  if (error) return <div style={{ padding: '15px', color: '#f48771' }}>❌ {error}</div>;

  // 4. رسم قائمة الدروس
  return (
    <div style={{ padding: '10px 0' }}>
      <h3 style={{ paddingLeft: '15px', color: '#cccccc', fontSize: '12px', textTransform: 'uppercase' }}>
        مستكشف الدروس
      </h3>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {lessons.map((lesson) => (
          <li 
            key={lesson.id} 
            // عند النقر، نرسل رقم الدرس المختار إلى الشاشة الرئيسية (Layout)
            onClick={() => onSelectLesson(lesson.id)}
            style={{
              padding: '8px 15px',
              cursor: 'pointer',
              color: currentLessonId === lesson.id ? '#ffffff' : '#cccccc',
              // تغيير لون الخلفية للدرس المحدد (Active State)
              backgroundColor: currentLessonId === lesson.id ? '#094771' : 'transparent',
              borderLeft: currentLessonId === lesson.id ? '3px solid #007acc' : '3px solid transparent',
              transition: 'background-color 0.2s',
              fontSize: '14px'
            }}
          >
            {/* أيقونة فيديو صغيرة بجانب اسم الدرس */}
            🎥 {lesson.title}
          </li>
        ))}
      </ul>
    </div>
  );
}