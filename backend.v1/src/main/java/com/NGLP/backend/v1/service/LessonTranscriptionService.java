package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Lesson;
import com.NGLP.backend.v1.entity.LessonTranscript;
import com.NGLP.backend.v1.repo.LessonRepo;
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
import org.springframework.scheduling.annotation.Async;
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
    private final LessonRepo lessonRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String AI_SERVICE_URL = "http://127.0.0.1:8000/transcribe";

    @Transactional
    @Async
    public void extractAndSaveTranscript(Long lessonId, MultipartFile videoFile) {
        Path tempFile = null;
        try {
            log.info("🎬 بدء معالجة الفيديو للدرس رقم: {}", lessonId);

            // 1. جلب كيان الدرس لربط النصوص به
            Lesson lesson = lessonRepo.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("الدرس غير موجود"));

            // 2. إنشاء ملف مؤقت
            tempFile = Files.createTempFile("upload_lesson_" + lessonId + "_", ".mp4");
            videoFile.transferTo(tempFile.toFile());

            // 3. تجهيز الطلب لإرسال الملف (هنا كان الجزء المفقود)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(tempFile.toFile()));

            // تعريف الـ requestEntity الذي كان مفقوداً!
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 4. إرسال الفيديو لسيرفر البايثون
            log.info("🚀 جاري إرسال الفيديو للذكاء الاصطناعي...");
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(AI_SERVICE_URL, requestEntity, String.class);

            // 5. قراءة الرد (JSON) وتحويله
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

                // ربط النص بالدرس
                transcript.setLesson(lesson);

                transcriptList.add(transcript);
            }

            // 6. حفظ النصوص في قاعدة البيانات
            transcriptRepo.saveAll(transcriptList);
            log.info("🎉 تمت العملية بنجاح! تم حفظ {} مقطع نصي للدرس رقم: {}", transcriptList.size(), lessonId);

        } catch (Exception e) {
            log.error("❌ حدث خطأ أثناء محاولة استخراج النص: ", e);
            throw new RuntimeException("فشل في استخراج النص من الفيديو", e);
        } finally {
            // 7. التنظيف
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (Exception e) {
                    log.warn("⚠️ لم يتمكن النظام من حذف الملف المؤقت: {}", tempFile.toAbsolutePath());
                }
            }
        }
    }
    // دالة جديدة لاسترجاع النصوص للواجهة الأمامية
    public List<LessonTranscript> getTranscriptsByLesson(Long lessonId) {
        return transcriptRepo.findByLessonIdOrderByStartSecondAsc(lessonId);
    }
}