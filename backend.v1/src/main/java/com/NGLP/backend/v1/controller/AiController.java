package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.ai.NglpAiAgent;
import com.NGLP.backend.v1.dto.AiAnswer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * المتحكم الخاص بعمليات الذكاء الاصطناعي (AI REST Controller).
 * يوفر نقاط اتصال (Endpoints) تتيح للواجهة الأمامية إرسال أسئلة الطلاب واستلام الردود.
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // السماح بالوصول من المتصفحات (CORS) لمرحلة التطوير
public class AiController {

    private final NglpAiAgent nglpAiAgent;

    /**
     * هيكل البيانات (DTO) الخاص بطلب المحادثة.
     * يسهل تنظيم البيانات القادمة من الطالب في جسم الطلب (Request Body).
     */
    public record AiRequest(
            Long userId,
            Long lessonId,
            String timestamp,
            String message,
            String conversationId
    ) {}

    /**
     * نقطة الاتصال لإرسال سؤال إلى المعلم الذكي.
     * المسار: POST /api/ai/ask
     *
     * @param request كائن يحتوي على بيانات السؤال والسياق (الدرس والوقت).
     * @return رد نصي يحتوي على إجابة الذكاء الاصطناعي.
     */
    @PostMapping("/ask")
    public ResponseEntity<?> askTutor(@RequestBody AiRequest request) {

        log.info("📩 استقبال سؤال جديد من المستخدم رقم: {} حول الدرس: {}",
                request.userId(), request.lessonId());

        try {
            // استدعاء الوكيل الذكي للحصول على الإجابة
            AiAnswer response = nglpAiAgent.ask(
                    request.userId(),
                    request.lessonId(),
                    request.timestamp(),
                    request.message(),
                    request.conversationId()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ خطأ أثناء معالجة سؤال الطالب: ", e);
            return ResponseEntity.internalServerError()
                    .body("عذراً، حدث خطأ أثناء محاولة الاتصال بالمعلم الذكي. يرجى المحاولة لاحقاً.");
        }
    }
}