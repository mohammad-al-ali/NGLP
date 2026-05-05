package com.NGLP.backend.v1.ai;

import com.NGLP.backend.v1.service.LessonTranscriptService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import java.util.function.Function;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;

/**
 * كلاس الإعدادات الخاص بأدوات الذكاء الاصطناعي (Function Calling).
 * يحتوي على الدوال التي يمكن للنموذج اللغوي (LLM) استدعاؤها برمجياً للحصول على بيانات إضافية.
 */
@Slf4j
@Configuration
public class AiToolsConfig {

    /**
     * هيكل البيانات (Record) الذي يمثل المدخلات التي سيطلبها الذكاء الاصطناعي.
     * ملاحظة: تم إبقاء الشروحات باللغة الإنجليزية عمداً لأن النموذج اللغوي يقرأها ليفهم نوع البيانات المطلوب.
     */
    public record TranscriptRequest(
            @JsonProperty(required = true)
            @JsonPropertyDescription("The unique ID of the lesson the student is currently watching.")
            Long lessonId,

            @JsonProperty(required = true)
            @JsonPropertyDescription("The video timestamp formatted as a String (e.g., '01:30' or '90').")
            String timestamp
    ) {}

    /**
     * هيكل البيانات الذي يمثل المخرجات (الرد) الذي سنرجعه للذكاء الاصطناعي.
     */
    public record TranscriptResponse(String context, boolean found) {}

    /**
     * أداة استخراج النص من الفيديو.
     * هذا الـ Bean يتم تحويله إلى أداة برمجية (Tool) يراها الذكاء الاصطناعي ويستخدمها.
     * * @param transcriptService خدمة التواصل مع قاعدة بيانات نصوص الدروس.
     * @return دالة (Function) تستقبل Request وترجع Response.
     */
    @Bean
    @Description("Fetches the exact transcript spoken by the teacher in the video at a specific timestamp. " +
            "CRITICAL: Always invoke this tool when a student asks a question about the video content, " +
            "needs clarification, or references a specific moment in the lesson.")
    public Function<TranscriptRequest, TranscriptResponse> fetchLessonTranscript(LessonTranscriptService transcriptService) {

        return request -> {
            // تسجيل حركة الذكاء الاصطناعي في سجلات النظام (Logs) للمراقبة والتتبع
            log.info("AI Agent triggered 'fetchLessonTranscript' for Lesson ID: {}, Timestamp: {}",
                    request.lessonId(), request.timestamp());

            try {
                // البحث عن النص في قاعدة البيانات بناءً على الوقت ورقم الدرس
                String context = transcriptService.findContextByTime(request.lessonId(), request.timestamp());

                // في حال تم العثور على النص، يتم إرجاعه للذكاء الاصطناعي ليبني إجابته عليه
                if (context != null && !context.isBlank()) {
                    return new TranscriptResponse(context, true);
                }

                // في حال لم يتم العثور على نص، نوجه الذكاء الاصطناعي للاعتماد على معرفته العامة
                return new TranscriptResponse("No transcript found at this timestamp. Please rely on your general knowledge to answer the student based on the lesson's main topic.", false);

            } catch (Exception e) {
                // التقاط الأخطاء لمنع انهيار النظام إذا حدثت مشكلة في قاعدة البيانات
                log.error("Error while AI tried to fetch transcript", e);
                return new TranscriptResponse("Error retrieving transcript from the database.", false);
            }
        };
    }
}