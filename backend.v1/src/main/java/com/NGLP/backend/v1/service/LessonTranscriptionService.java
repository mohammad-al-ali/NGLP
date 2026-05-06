package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Lesson;
import com.NGLP.backend.v1.entity.LessonTranscript;
import com.NGLP.backend.v1.repo.LessonTranscriptRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonTranscriptionService {

    private final LessonTranscriptRepo transcriptRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String AI_SERVICE_URL = "http://127.0.0.1:8000/transcribe";

    public void extractAndSaveTranscript(Long lessonId, MultipartFile videoFile) {
        Path tempFile = null; // تعريف مسار الملف المؤقت
        try {
            log.info("🎬 بدء معالجة الفيديو للدرس رقم: {}", lessonId);

            // 1. إنشاء ملف مؤقت في نظام التشغيل ونقل بيانات الفيديو إليه
            tempFile = Files.createTempFile("upload_lesson_" + lessonId + "_", ".mp4");
            videoFile.transferTo(tempFile.toFile());
            log.info("تم حفظ الملف مؤقتاً في: {}", tempFile.toAbsolutePath());

            // 2. تجهيز الطلب لإرسال الملف (Multipart Form Data)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            // نستخدم الملف المؤقت الذي أنشأناه للتو
            body.add("file", new FileSystemResource(tempFile.toFile()));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. إرسال الفيديو لسيرفر البايثون
            log.info("🚀 جاري إرسال الفيديو للذكاء الاصطناعي...");
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(AI_SERVICE_URL, requestEntity, String.class);

            // 4. قراءة الرد (JSON) وتحويله
            log.info("✅ تم استلام الرد من الذكاء الاصطناعي، جاري التحليل...");
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            if (rootNode.has("error")) {
                throw new RuntimeException("خطأ من سيرفر بايثون: " + rootNode.get("error").asText());
            }

            JsonNode transcriptions = rootNode.path("transcription");
            List<LessonTranscript> transcriptList = new ArrayList<>();

            for (JsonNode node : transcriptions) {
                LessonTranscript transcript = new LessonTranscript();
                transcript.setStartSecond(node.path("start").asInt());
                transcript.setEndSecond(node.path("end").asInt());
                transcript.setTranscriptContent(node.path("text").asText());

                transcriptList.add(transcript);
            }

            // 5. حفظ النصوص في قاعدة البيانات
            transcriptRepo.saveAll(transcriptList);
            log.info("🎉 تمت العملية بنجاح! تم حفظ {} مقطع نصي.", transcriptList.size());

        } catch (Exception e) {
            log.error("❌ حدث خطأ أثناء محاولة استخراج النص: ", e);
            throw new RuntimeException("فشل في استخراج النص من الفيديو", e);
        } finally {
            // 6. التنظيف: حذف الملف المؤقت في جميع الأحوال (نجاح أو فشل) لتجنب امتلاء السيرفر
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                    log.info("🧹 تم حذف الملف المؤقت بنجاح.");
                } catch (Exception e) {
                    log.warn("⚠️ لم يتمكن النظام من حذف الملف المؤقت: {}", tempFile.toAbsolutePath());
                }
            }
        }
    }
}