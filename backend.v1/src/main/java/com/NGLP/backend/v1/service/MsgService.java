package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.entity.Msg;
import com.NGLP.backend.v1.repo.MsgRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MsgService {

    private final MsgRepo msgRepo;

    /**
     * دالة مخصصة لجلب سجل الدردشة (تُستدعى عندما يفتح الطالب صفحة الدرس)
     */
    public List<Msg> getChatHistory(Long conversationId) {
        return msgRepo.findByConversationIdOrderBySentAtAsc(conversationId);
    }

    /**
     * دالة مبسطة لإنشاء رسالة وحفظها فوراً (تُستدعى من داخل AiController)
     * @param conversation المحادثة الحالية
     * @param content محتوى الرسالة
     * @param senderType نوع المرسل ("USER" أو "AI")
     * @param videoTimestamp توقيت الفيديو (اختياري)
     */
    public Msg saveMessage(Conversation conversation, String content, String senderType, Integer videoTimestamp) {
        Msg message = new Msg();
        message.setConversation(conversation);
        message.setContent(content);
        message.setSenderType(senderType);
        message.setVideoTimestamp(videoTimestamp);
        message.setSentAt(LocalDateTime.now());

        return msgRepo.save(message);
    }
}