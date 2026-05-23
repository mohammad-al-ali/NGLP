//package com.NGLP.backend.v1.controller;
//
//import com.NGLP.backend.v1.entity.LessonTranscript;
//import com.NGLP.backend.v1.service.LessonTranscriptService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/v1/transcripts")
//@RequiredArgsConstructor
//public class LessonTranscriptController {
//    private final LessonTranscriptService transcriptService;
//
//    @GetMapping
//    public ResponseEntity<List<LessonTranscript>> getAll(@RequestParam(required = false) Long lessonId) {
//        if (lessonId != null) {
//            return ResponseEntity.ok(transcriptService.findByLesson(lessonId));
//        }
//        return ResponseEntity.ok(transcriptService.findAll());
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<LessonTranscript> getById(@PathVariable Long id) {
//        return ResponseEntity.ok(transcriptService.findById(id));
//    }
//
//    @PostMapping
//    public ResponseEntity<LessonTranscript> create(@RequestBody LessonTranscript transcript) {
//        return ResponseEntity.ok(transcriptService.create(transcript));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<LessonTranscript> update(@PathVariable Long id, @RequestBody LessonTranscript transcript) {
//        return ResponseEntity.ok(transcriptService.update(id, transcript));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        transcriptService.delete(id);
//        return ResponseEntity.noContent().build();
//    }
//}
