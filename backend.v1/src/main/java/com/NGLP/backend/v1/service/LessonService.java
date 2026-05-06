package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Lesson;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.LessonRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class LessonService {
    private final LessonRepo lessonRepo;
    private final LessonTranscriptionService transcriptionService;
    public LessonService(LessonRepo lessonRepo ,LessonTranscriptionService transcriptionService) {
        this.lessonRepo = lessonRepo;
        this.transcriptionService =transcriptionService;
    }

    public List<Lesson> findAll() { return lessonRepo.findAll(); }

    public Lesson findById(Long id) {
        return lessonRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
    }

    @Transactional // مهم جداً لضمان استقرار قاعدة البيانات
    public Lesson create(Lesson lesson, MultipartFile file) {
        // 1. حفظ بيانات الدرس أولاً في قاعدة البيانات للحصول على الـ ID
        Lesson savedLesson = lessonRepo.save(lesson);

        // 2. استدعاء خدمة استخراج النص باستخدام الـ ID الجديد والملف
        // ملاحظة: بما أن العملية تأخذ وقتاً، يفضل لاحقاً جعلها @Async (سنتحدث عن هذا لاحقاً)
        transcriptionService.extractAndSaveTranscript(savedLesson.getId(), file);

        return savedLesson;
    }

    public Lesson update(Long id, Lesson lesson) {
        return lessonRepo.findById(id).map(existing -> {
            existing.setTitle(lesson.getTitle());
            existing.setVideoUrl(lesson.getVideoUrl());
            existing.setDurationSeconds(lesson.getDurationSeconds());
            existing.setCourse(lesson.getCourse());
            return lessonRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
    }

    public void delete(Long id) { lessonRepo.deleteById(id); }
}
