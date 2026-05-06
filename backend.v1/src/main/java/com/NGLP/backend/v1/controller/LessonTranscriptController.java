package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.LessonTranscript;
import com.NGLP.backend.v1.service.LessonTranscriptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transcripts")
public class LessonTranscriptController {
    private final LessonTranscriptService transcriptService;

    public LessonTranscriptController(LessonTranscriptService transcriptService) { this.transcriptService = transcriptService; }

    @GetMapping
    public List<LessonTranscript> getAll() { return transcriptService.findAll(); }

    @GetMapping("/{id}")
    public LessonTranscript getById(@PathVariable Long id) { return transcriptService.findById(id); }

    @PostMapping
    public LessonTranscript create(@RequestBody LessonTranscript t) { return transcriptService.create(t); }

    @PutMapping("/{id}")
    public LessonTranscript update(@PathVariable Long id, @RequestBody LessonTranscript t) { return transcriptService.update(id, t); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transcriptService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
