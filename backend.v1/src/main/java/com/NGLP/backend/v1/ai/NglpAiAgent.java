package com.NGLP.backend.v1.ai;

import com.NGLP.backend.v1.service.ConversationService;
import com.NGLP.backend.v1.dto.AiAnswer;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

/**
 * الوكيل الذكي (AI Agent) الخاص بمنصة NGLP.
 * يعمل هذا الكلاس كـ "عقل" النظام، حيث يستقبل أسئلة الطلاب، يربطها بسياق المحادثة (الذاكرة)،
 * ويقرر متى يستخدم الأدوات (Tools) لجلب نصوص الفيديوهات من قاعدة البيانات.
 */

/**
 * الوكيل الذكي (AI Agent) الخاص بمنصة NGLP.
 */
@Service
public class NglpAiAgent {

    // المتغيرات النهائية (التبعيات)
    private final ConversationService conversationService;
    private final ChatClient chatClient;

    /**
     * باني الكلاس (Constructor) - يقوم بحقن التبعيات وتهيئة الذكاء الاصطناعي.
     * لا نحتاج @RequiredArgsConstructor لأننا نكتب الباني بأنفسنا.
     */
    public NglpAiAgent(ConversationService conversationService, ChatClient.Builder builder, ChatMemory chatMemory) {

        // 1. حقن خدمة المحادثات (هذا السطر يحل الخطأ الذي ظهر لك!)
        this.conversationService = conversationService;

        // 2. تعليمات النظام
        String systemPrompt = """
            You are a smart and friendly AI Tutor on the NGLP educational platform.
            Your main mission is to help students by answering their questions clearly
            and simply, based strictly on the lesson's content.

            CRITICAL RULES:
            1. Always use the 'fetchLessonTranscript' tool to retrieve the lesson's
               context based on the provided lesson ID and timestamp.
            2. Base your answers ONLY on the retrieved transcript.
            3. If the student's question is completely outside the scope of the lesson
               or programming, politely ask them to focus on the course material.
            4. ALWAYS respond to the student in clear, friendly, and professional
               Arabic language.
            """;

        // 3. بناء محرك الذكاء الاصطناعي
        this.chatClient = builder
                .defaultSystem(systemPrompt)
                // تنبيه مهم: استخدم defaultFunctions وليس defaultToolNames لتجنب خطأ @Tool
                .defaultToolNames("fetchLessonTranscript")
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build();
    }

    /**
     * الدالة الرئيسية لاستقبال أسئلة الطلاب.
     */
    public AiAnswer ask(Long userId, Long lessonId, String timestamp, String message, String conversationId) {

        // 1. جلب رقم المحادثة الحقيقي أو إنشاء محادثة جديدة عبر الخدمة (Service)
        String activeConversationId = conversationService.getOrCreateConversationId(userId, lessonId, conversationId);

        // 2. دمج سؤال الطالب مع بيانات النظام
        String enrichedPrompt = String.format(
                "Student Question: %s\n[System Info: lessonId=%d, timestamp=%s]",
                message, lessonId, timestamp
        );

        // 3. إرسال الطلب للذكاء الاصطناعي مع إرفاق رقم المحادثة الحقيقي للذاكرة
        String aiResponse = this.chatClient.prompt()
                .user(enrichedPrompt)
                .advisors(advisorSpec -> advisorSpec
                        .param(ChatMemory.CONVERSATION_ID, activeConversationId)
                )
                .call()
                .content();

        // 4. إرجاع الإجابة مع رقم المحادثة للمتحكم (Controller)
        return new AiAnswer(aiResponse, activeConversationId);
    }
}