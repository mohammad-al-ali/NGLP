package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.ai.NglpAiAgent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
/**
 * المتحكم الخاص بعمليات الذكاء الاصطناعي (AI REST Controller).
 * يوفر نقاط اتصال (Endpoints) تتيح للواجهة الأمامية إرسال أسئلة الطلاب واستلام الردود.
 */


@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final NglpAiAgent nglpAiAgent;

    /**
     * هيكل البيانات (Record) الخاص بطلب المحادثة.
     * 1. تم إزالة conversationId لأن السيرفر الآن ذكي بما يكفي لجلبها أو إنشائها بنفسه.
     * 2. تم تحويل timestamp إلى Integer (ثواني الفيديو) ليكون منطقياً أكثر.
     */
    public record AiRequest(
            Long userId,
            Long lessonId,
            Integer timestamp,
            String message
    ) {}

    /**
     * نقطة الاتصال لإرسال سؤال إلى المعلم الذكي.
     * المسار: POST /api/v1/ai/messages
     *
     * @param request كائن يحتوي على بيانات السؤال والسياق (الدرس والوقت).
     * @return رد JSON يحتوي على إجابة الذكاء الاصطناعي.
     */
    @PostMapping("/messages")
    public ResponseEntity<?> askTutor(@RequestBody AiRequest request) {

        log.info("📩 استقبال سؤال جديد من المستخدم رقم: {} حول الدرس: {} في الثانية: {}",
                request.userId(), request.lessonId(), request.timestamp());

        try {
            // استدعاء الوكيل الذكي للحصول على الإجابة (ترجع String الآن)
            String aiResponse = nglpAiAgent.ask(
                    request.userId(),
                    request.lessonId(),
                    request.timestamp(),
                    request.message()
            );

            // نغلف الرد في Map ليتحول إلى JSON نظيف ومفهوم للـ Frontend
            // النتيجة ستكون: { "response": "إجابة الذكاء الاصطناعي هنا" }
            return ResponseEntity.ok(Map.of("response", aiResponse));

        } catch (Exception e) {
            log.error("❌ خطأ أثناء معالجة سؤال الطالب: ", e);
            // إرجاع الخطأ أيضاً كـ JSON لكي يستطيع الـ Frontend التعامل معه بسهولة
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "عذراً، حدث خطأ أثناء محاولة الاتصال بالمعلم الذكي. يرجى المحاولة لاحقاً."));
        }
    }
}