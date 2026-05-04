package com.NGLP.backend.controller;

import com.NGLP.backend.entity.Lesson;
import com.NGLP.backend.repository.LessonRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/lessons")
public class LessonController {

    private final LessonRepository lessonRepository;

    public LessonController(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    // جلب جميع الدروس
    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    // جلب درس واحد حسب id
    @GetMapping("/{id}")
    public Lesson getLessonById(@PathVariable Long id) {
        return lessonRepository.findById(id).orElse(null);
    }

    // إضافة درس جديد
    @PostMapping
    public Lesson createLesson(@RequestBody Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    // تعديل درس
    @PutMapping("/{id}")
    public Lesson updateLesson(@PathVariable Long id, @RequestBody Lesson lessonDetails) {
        Lesson lesson = lessonRepository.findById(id).orElse(null);
        if (lesson != null) {
            lesson.setTitle(lessonDetails.getTitle());
            lesson.setContent(lessonDetails.getContent());
            lesson.setVideoUrl(lessonDetails.getVideoUrl());
            lesson.setOrderIndex(lessonDetails.getOrderIndex());
            lesson.setCourse(lessonDetails.getCourse());
            return lessonRepository.save(lesson);
        }
        return null;
    }

    // حذف درس
    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Long id) {
        lessonRepository.deleteById(id);
    }
}