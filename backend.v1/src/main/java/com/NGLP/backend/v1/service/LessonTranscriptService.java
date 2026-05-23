package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Lesson;
import com.NGLP.backend.v1.entity.LessonTranscript;
import com.NGLP.backend.v1.repo.LessonRepo;
import com.NGLP.backend.v1.repo.LessonTranscriptRepo;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonTranscriptService {

    private final LessonTranscriptRepo transcriptRepo;
    private final LessonRepo lessonRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String AI_SERVICE_URL = "http://127.0.0.1:8000/transcribe";

    // --- أولاً: عمليات الاستخراج (التي كانت في الملف الأول) ---
    // 🌟 ألغينا @Transactional لأننا لا نحتاج لفتح معاملة جديدة للبحث
    @Async
    public void extractAndSaveTranscript(Lesson lesson, String savedVideoAbsolutePath) {
        try {
            log.info("🎬 بدء معالجة الفيديو للدرس رقم: {}", lesson.getId());

            // 1. نحن لا نحتاج لإنشاء ملف مؤقت، لأن الفيديو محفوظ بالفعل على سيرفرك!
            File videoFileToUpload = new File(savedVideoAbsolutePath);

            if (!videoFileToUpload.exists()) {
                throw new RuntimeException("ملف الفيديو غير موجود على السيرفر في المسار: " + savedVideoAbsolutePath);
            }

            // 2. تجهيز الطلب لإرسال الملف
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(videoFileToUpload));

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

                // 🌟 استخدام كائن Lesson المرر مباشرة (لا حاجة للبحث عنه)
                transcript.setLesson(lesson);

                transcriptList.add(transcript);
            }

            // 5. حفظ النصوص في قاعدة البيانات
            transcriptRepo.saveAll(transcriptList);
            log.info("🎉 تمت العملية بنجاح! تم حفظ {} مقطع نصي للدرس رقم: {}", transcriptList.size(), lesson.getId());

        } catch (Exception e) {
            log.error("❌ حدث خطأ أثناء محاولة استخراج النص: ", e);
        }
        // 🌟 ألغينا الـ finally الذي يحذف الملف، لأننا استخدمنا الملف الأصلي للكورس ولا نريد حذفه!
    }
    // --- ثانياً: عمليات الإدارة والبحث (التي كانت في الملف الثاني) ---

    public List<LessonTranscript> findByLesson(Long lessonId) {
        return transcriptRepo.findByLessonIdOrderByStartSecondAsc(lessonId);
    }

    public String findContextByTime(Long lessonId, String timestampStr) {
        try {
            Integer timestampSeconds = parseTimestampToSeconds(timestampStr);
            return transcriptRepo.findTranscriptAtTimestamp(lessonId, timestampSeconds)
                    .map(LessonTranscript::getTranscriptContent)
                    .orElse(null);
        } catch (Exception e) {
            log.error("خطأ أثناء البحث عن النص للوقت: {}", timestampStr);
            return null;
        }
    }

    // الدالة المساعدة
    private Integer parseTimestampToSeconds(String timestampStr) {
        if (timestampStr == null || timestampStr.isBlank()) return 0;
        if (timestampStr.contains(":")) {
            String[] parts = timestampStr.split(":");
            return (Integer.parseInt(parts[0].trim()) * 60) + Integer.parseInt(parts[1].trim());
        }
        return Integer.parseInt(timestampStr.trim());
    }

    // ميثودز CRUD أساسية (اختيارية حسب حاجتك)
    public void deleteByLesson(Long lessonId) {
        List<LessonTranscript> transcripts = transcriptRepo.findByLessonIdOrderByStartSecondAsc(lessonId);
        transcriptRepo.deleteAll(transcripts);
    }
}