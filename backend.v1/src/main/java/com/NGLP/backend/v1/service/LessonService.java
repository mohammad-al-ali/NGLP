package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Lesson;
import com.NGLP.backend.v1.repo.LessonRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepo lessonRepo;
    private final LessonTranscriptionService transcriptionService;
    private final FileStorageService fileStorageService;

    // 1. تم استبدال findAll لنجلب الدروس بناءً على الكورس
    public List<Lesson> findLessonsByCourse(Long courseId) {
        return lessonRepo.findByCourseId(courseId);
    }

    public Lesson findById(Long id) {
        return lessonRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lessonnot found with this"+ id));
    }

    @Transactional
    public Lesson create(Lesson lesson, MultipartFile file) {
        // 1. حفظ الفيديو محلياً والحصول على الرابط
        String videoUrl = fileStorageService.saveVideo(file);

        // 2. إسناد الرابط للدرس
        lesson.setVideoUrl(videoUrl);

        // 3. حفظ بيانات الدرس في قاعدة البيانات
        Lesson savedLesson = lessonRepo.save(lesson);

        // 4. استدعاء خدمة استخراج النص للذكاء الاصطناعي
        transcriptionService.extractAndSaveTranscript(savedLesson.getId(), file);

        return savedLesson;
    }

    public Lesson update(Long id, Lesson lesson) {
        return lessonRepo.findById(id).map(existing -> {
            existing.setTitle(lesson.getTitle());
            existing.setDescription(lesson.getDescription());
            existing.setVideoUrl(lesson.getVideoUrl());
            existing.setDurationSeconds(lesson.getDurationSeconds());
            existing.setCourse(lesson.getCourse());
            return lessonRepo.save(existing);
        }).orElseThrow(() -> new EntityNotFoundException("Lesson not found with this id"+ id));
    }

    @Transactional
    public void delete(Long id) {
        lessonRepo.deleteById(id);
    }

    public boolean existsByCourseId(Long id) {
        return lessonRepo.existsByCourseId(id);
    }
}
