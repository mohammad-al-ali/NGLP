package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.service.LessonTranscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/transcription")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TranscriptionController {

    private final LessonTranscriptionService transcriptionService;

    // تحديد نوع البيانات المستهلكة (consumes) إلى MULTIPART_FORM_DATA
    @PostMapping(value = "/process-video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> processVideo(
            @RequestParam("lessonId") Long lessonId,
            @RequestParam("file") MultipartFile file) {

        log.info("📩 استلام طلب معالجة فيديو للدرس رقم: {}. حجم الملف: {} بايت", lessonId, file.getSize());

        try {
            // التحقق من أن الملف ليس فارغاً
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ملف الفيديو فارغ أو مفقود."));
            }

            // استدعاء الخدمة المحدثة
            transcriptionService.extractAndSaveTranscript(lessonId, file);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "تم استخراج النص والتوقيت وحفظهما في قاعدة البيانات بنجاح!"
            ));
        } catch (Exception e) {
            log.error("❌ فشل في معالجة الفيديو: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}