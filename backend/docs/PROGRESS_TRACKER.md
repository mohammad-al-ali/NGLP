# تتبع التقدم في مشروع NGLP Backend

## نظرة عامة
هذا الملف يعمل كـ "حالة حفظ" للمشروع، ويحتوي على جدول يتتبع حالة جميع المهام. يتم تحديثه تلقائياً بعد كل مهمة تكتمل. الحالات الممكنة: To Do, In Progress, Done.

## جدول المهام

| المهمة | الحالة | الملاحظات |
|--------|--------|------------|
| إنشاء مجلد docs وملفات الذاكرة الأساسية (ARCHITECTURE_RULES.md, PROJECT_PLAN.md, PROGRESS_TRACKER.md) | Done | تم إنشاء المجلد والملفات الثلاثة بنجاح في 24 أبريل 2026. |
| Sprint 1: إعداد Spring Boot و MySQL | Done | تم تحديث pom.xml بإضافة التبعيات المطلوبة، تعديل Java version إلى 21، وتكوين application.properties لـ MySQL و Swagger. |
| Sprint 1: تصميم Entities (User, Lesson, Transcript) | Done | تم إنشاء User.java, Lesson.java, Transcript.java مع الـ annotations المناسبة و Lombok. تم تمكين JPA Auditing. |
| Sprint 1: إنشاء Repositories | Done | تم إنشاء UserRepository.java, LessonRepository.java, TranscriptRepository.java مع الطرق المطلوبة. |
| Sprint 1: إعداد Global Exception Handling | Done | تم إنشاء GlobalExceptionHandler.java و ResourceNotFoundException.java لمعالجة الاستثناءات مركزياً. |
| Sprint 1: كتابة اختبارات أساسية | Done | تم إنشاء UserRepositoryTest.java مع اختبارات للـ save و findByUsername و findByEmail. |
| Sprint 2: تطبيق Strategy Pattern للتخزين | To Do | - |
| Sprint 2: بناء LocalStorageServiceImpl | To Do | - |
| Sprint 2: بناء CloudinaryStorageServiceImpl | To Do | - |
| Sprint 2: إعداد Spring Profiles | To Do | - |
| Sprint 3: برمجة Async tasks للفيديوهات | To Do | - |
| Sprint 3: دمج Whisper AI | To Do | - |
| Sprint 3: حفظ Transcripts في MySQL | To Do | - |
| Sprint 4: دمج Spring AI | To Do | - |
| Sprint 4: تطبيق Function Calling | To Do | - |
| Sprint 4: برمجة API للاستفسارات | To Do | - |
| Sprint 5: تطبيق Spring Security مع JWT | To Do | - |
| Sprint 5: توثيق APIs بـ Swagger | To Do | - |

## ملاحظات إضافية
- التاريخ الأخير للتحديث: 24 أبريل 2026
- المسؤول عن التحديث: المهندس البرمجي (AI Assistant)
- تم إكمال Sprint 1 بالكامل. جاهز للبدء في Sprint 2.