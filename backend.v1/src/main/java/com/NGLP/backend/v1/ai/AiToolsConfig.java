package com.NGLP.backend.v1.ai;

import com.NGLP.backend.v1.service.LessonTranscriptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

/**
 * كلاس الإعدادات الخاص بأدوات الذكاء الاصطناعي (Function Calling).
 * يحتوي على الدوال التي يمكن للنموذج اللغوي (LLM) استدعاؤها برمجياً للحصول على بيانات إضافية.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiToolsConfig {

    private final LessonTranscriptService transcriptService;

    public record TranscriptResponse(String context, boolean found) {}

    /**
     * 🌟 الحل النهائي: استقبال جميع المعاملات كـ String في الـ Tool
     * هذا يضمن مطابقة الـ Schema تماماً مع ما يرسله الـ LLM وينهي خطأ الـ HTTP 400.
     */
    @Tool(name = "fetchLessonTranscript", description = "Fetches the exact transcript spoken by the teacher in the video at a specific timestamp.")
    public TranscriptResponse fetchLessonTranscript(
            @ToolParam(description = "The unique ID of the lesson as a string.") String lessonId,
            @ToolParam(description = "The video timestamp formatted as a String (e.g., '100').") String timestamp
    ) {

        log.info("🚀 AI Agent triggered Tool 'fetchLessonTranscript' with String params -> Lesson ID: {}, Timestamp: {}",
                lessonId, timestamp);

        try {
            // 🌟 تحويل الـ lessonId بأمان من String إلى Long في كود الجافا الداخلي
            Long parsedLessonId = Long.parseLong(lessonId.trim());

            // استدعاء الخدمة (التي تتعامل داخلياً مع الـ timestamp بشكل مرن كما كتبناها سابقاً)
            String context = transcriptService.findContextByTime(parsedLessonId, timestamp);

            if (context != null && !context.isBlank()) {
                log.info("✅ Context found successfully from DB. Returning to LLM.");
                return new TranscriptResponse(context, true);
            }

            return new TranscriptResponse("No transcript found at this timestamp. Please rely on your general knowledge.", false);

        } catch (NumberFormatException nfe) {
            log.error("❌ Failed to parse lessonId from LLM: {}", lessonId);
            return new TranscriptResponse("Invalid lesson ID format provided.", false);
        } catch (Exception e) {
            log.error("❌ Error while executing tool logic", e);
            return new TranscriptResponse("Error retrieving transcript from database.", false);
        }
    }
}