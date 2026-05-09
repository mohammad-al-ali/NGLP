package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.LessonTranscript;
import com.NGLP.backend.v1.repo.LessonTranscriptRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Optional;
@Slf4j
@Service
public class LessonTranscriptService {
    private final LessonTranscriptRepo transcriptRepo;

    public LessonTranscriptService(LessonTranscriptRepo transcriptRepo) { this.transcriptRepo = transcriptRepo; }

    public List<LessonTranscript> findAll() { return transcriptRepo.findAll(); }

    public LessonTranscript findById(Long id) {
        return transcriptRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("LessonTranscript not found with this"+ id));
    }

    public LessonTranscript create(LessonTranscript transcript) { return transcriptRepo.save(transcript); }

    public List<LessonTranscript> findByLesson(Long lessonId) {
        return transcriptRepo.findByLessonIdOrderByStartSecondAsc(lessonId);
    }

    public LessonTranscript update(Long id, LessonTranscript transcript) {
        return transcriptRepo.findById(id).map(existing -> {
            existing.setLesson(transcript.getLesson());
            existing.setStartSecond(transcript.getStartSecond());
            existing.setEndSecond(transcript.getEndSecond());
            existing.setTranscriptContent(transcript.getTranscriptContent());
            return transcriptRepo.save(existing);
        }).orElseThrow(() -> new EntityNotFoundException("LessonTranscript Not Found with"+ id));
    }

    public void delete(Long id) { transcriptRepo.deleteById(id); }

    /**
     * البحث عن النص بناءً على رقم الدرس والوقت النصي.
     */
    public String findContextByTime(Long lessonId, String timestampStr) {
        try {
            // 1. تحويل الوقت النصي إلى ثوانٍ رقمية
            Integer timestampSeconds = parseTimestampToSeconds(timestampStr);

            // 2. البحث في قاعدة البيانات باستخدام الدالة الصحيحة
            Optional<LessonTranscript> transcriptOpt = transcriptRepo.findTranscriptAtTimestamp(lessonId, timestampSeconds);

            // 3. إرجاع النص إذا وُجد، أو null إذا لم يُوجد
            return transcriptOpt.map(LessonTranscript::getTranscriptContent).orElse(null);

        } catch (Exception e) {
            log.error("خطأ أثناء معالجة الوقت أو البحث عن النص: {}", timestampStr, e);
            return null;
        }
    }

    /**
     * دالة مساعدة لتحويل الوقت من String إلى Integer (ثواني).
     * تتعامل مع صيغة الثواني المباشرة "120" أو صيغة الدقائق "02:00".
     */
    private Integer parseTimestampToSeconds(String timestampStr) {
        if (timestampStr == null || timestampStr.isBlank()) {
            return 0;
        }

        // إذا كان يحتوي على نقطتين (مثل 01:30)
        if (timestampStr.contains(":")) {
            String[] parts = timestampStr.split(":");
            int minutes = Integer.parseInt(parts[0].trim());
            int seconds = Integer.parseInt(parts[1].trim());
            return (minutes * 60) + seconds;
        }

        // إذا كان مجرد رقم (مثل 90)
        return Integer.parseInt(timestampStr.trim());
    }
}
