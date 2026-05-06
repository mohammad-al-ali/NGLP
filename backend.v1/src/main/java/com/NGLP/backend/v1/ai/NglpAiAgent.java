package com.NGLP.backend.v1.ai;

import com.NGLP.backend.v1.service.ConversationService;
import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.service.MsgService;
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

    private final ConversationService conversationService;
    private final MsgService msgService; // 🌟 حقن خدمة الرسائل
    private final ChatClient chatClient;

    public NglpAiAgent(ConversationService conversationService, MsgService msgService, ChatClient.Builder builder, ChatMemory chatMemory) {
        this.conversationService = conversationService;
        this.msgService = msgService;

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

        this.chatClient = builder
                .defaultSystem(systemPrompt)
                .defaultToolNames("fetchLessonTranscript")
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build();
    }

    /**
     * الدالة الرئيسية لاستقبال أسئلة الطلاب.
     * لاحظ أننا ألغينا الـ AiAnswer واستخدمنا String للإرجاع للتبسيط.
     */
    public String ask(Long userId, Long lessonId, Integer timestamp, String message) {

        // 1. جلب أو إنشاء محادثة الطالب لهذا الدرس (الدالة الجديدة)
        Conversation conversation = conversationService.getOrCreateConversation(userId, lessonId);
        String activeConversationId = String.valueOf(conversation.getId());

        // 2. 🌟 حفظ سؤال الطالب في قاعدة البيانات مباشرة!
        msgService.saveMessage(conversation, message, "USER", timestamp);

        // 3. دمج سؤال الطالب مع بيانات النظام
        String enrichedPrompt = String.format(
                "Student Question: %s\n[System Info: lessonId=%d, timestamp=%d]",
                message, lessonId, timestamp
        );

        // 4. إرسال الطلب للذكاء الاصطناعي
        String aiResponse = this.chatClient.prompt()
                .user(enrichedPrompt)
                .advisors(advisorSpec -> advisorSpec
                        .param(ChatMemory.CONVERSATION_ID, activeConversationId)
                )
                .call()
                .content();

        // 5. 🌟 حفظ إجابة الذكاء الاصطناعي في قاعدة البيانات!
        msgService.saveMessage(conversation, aiResponse, "AI", timestamp);

        // 6. إرجاع النص للواجهة الأمامية
        return aiResponse;
    }
}