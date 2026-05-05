package com.NGLP.backend.v1.ai;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.entity.Msg;
import com.NGLP.backend.v1.repo.ConversationRepo;
import com.NGLP.backend.v1.repo.MsgRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
/**
 * مزود ذاكرة المحادثة המعتمد على قاعدة البيانات (Database-backed Chat Memory).
 * يقوم بتطبيق واجهة ChatMemory الخاصة بـ Spring AI ليقوم بحفظ واسترجاع الرسائل تلقائياً من MySQL.
 */
@Component
@RequiredArgsConstructor
public class DatabaseChatMemory implements ChatMemory {

    private final ConversationRepo conversationRepository;
    private final MsgRepo msgRepository;

    /**
     * حفظ قائمة من الرسائل الجديدة في قاعدة البيانات المرتبطة بمحادثة معينة.
     *
     * @param conversationId المعرّف النصي للمحادثة.
     * @param aiMessages     قائمة الرسائل (الطالب أو الذكاء الاصطناعي) المراد حفظها.
     */
    @Override
    @Transactional // تضمن هذه الخاصية تراجع النظام عن الحفظ إذا حدث خطأ جزئي (Rollback)
    public void add(String conversationId, List<Message> aiMessages) {
        Long convId = parseConversationId(conversationId);
        if (convId == null) return; // حماية النظام من الانهيار إذا كان المعرف غير صالح

        // جلب كائن المحادثة من قاعدة البيانات للربط (Foreign Key)
        Conversation conversation = conversationRepository.findById(convId)
                .orElseThrow(() -> new RuntimeException("Conversation Not found: " + convId));

        List<Msg> dbMessages = new ArrayList<>();

        // تحويل رسائل Spring AI إلى كيانات قاعدة البيانات (Entities) الخاصة بنا
        for (Message aiMsg : aiMessages) {
            Msg dbMsg = new Msg();
            dbMsg.setConversation(conversation);
            dbMsg.setContent(aiMsg.getText());
            dbMsg.setSentAt(LocalDateTime.now());

            // تصنيف نوع المرسل
            if (aiMsg.getMessageType() == MessageType.USER) {
                dbMsg.setSenderType("USER");
            } else if (aiMsg.getMessageType() == MessageType.ASSISTANT) {
                dbMsg.setSenderType("ASSISTANT");
            } else {
                dbMsg.setSenderType("SYSTEM");
            }

            dbMessages.add(dbMsg);
        }

        // حفظ جميع الرسائل دفعة واحدة لتحسين الأداء
        msgRepository.saveAll(dbMessages);
    }

    /**
     * استرجاع جميع الرسائل الخاصة بمحادثة معينة (يتم توجيهها للدالة المحددة بالعدد).
     */
    @Override
    public List<Message> get(String conversationId) {
        return get(conversationId, 100); // الجلب الافتراضي لآخر 100 رسالة
    }

    /**
     * استرجاع آخر N رسالة لمحادثة معينة وتمريرها للذكاء الاصطناعي ليفهم السياق.
     *
     * @param conversationId المعرّف النصي للمحادثة.
     * @param lastN          عدد الرسائل المراد استرجاعها.
     * @return قائمة بكائنات Message المفهومة لـ Spring AI.
     */
    public List<Message> get(String conversationId, int lastN) {
        Long convId = parseConversationId(conversationId);
        if (convId == null) return List.of(); // إرجاع قائمة فارغة بأمان

        // جلب الرسائل من قاعدة البيانات باستخدام Pagination
        List<Msg> dbMessages = msgRepository.findLastMessages(convId, PageRequest.of(0, lastN));

        // عكس الترتيب الزمني ليقرأها الذكاء الاصطناعي بشكل منطقي (من الأقدم للأحدث)
        Collections.reverse(dbMessages);

        // تحويل كيانات قاعدة البيانات (Entities) إلى كائنات Spring AI Messages
        return dbMessages.stream().map(dbMsg -> {
            if ("USER".equalsIgnoreCase(dbMsg.getSenderType())) {
                return new UserMessage(dbMsg.getContent());
            } else if ("ASSISTANT".equalsIgnoreCase(dbMsg.getSenderType())) {
                return new AssistantMessage(dbMsg.getContent());
            } else {
                return new SystemMessage(dbMsg.getContent());
            }
        }).collect(Collectors.toList());
    }

    /**
     * مسح جميع الرسائل المرتبطة بمحادثة معينة.
     */
    @Override
    @Transactional
    public void clear(String conversationId) {
        Long convId = parseConversationId(conversationId);
        if (convId != null) {
            msgRepository.deleteByConversationId(convId);
        }
    }

    /**
     * دالة مساعدة (Helper Method) لتحويل الـ ID النصي القادم من Spring AI إلى Long رقمي.
     * تحمي النظام من الانهيار إذا أرسل النظام قيمة مثل "default".
     */
    private Long parseConversationId(String conversationId) {
        try {
            return Long.parseLong(conversationId);
        } catch (NumberFormatException e) {
            return null; // إرجاع null بأمان بدلاً من رمي Exception
        }
    }
}