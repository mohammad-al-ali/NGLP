package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.ConversationRepo;
import com.NGLP.backend.v1.repo.LessonRepo;
import com.NGLP.backend.v1.repo.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {
     private final ConversationRepo conversationRepo;
     private final UserRepo userRepo;
     private final LessonRepo lessonRepo;


    public List<Conversation> findAll() { return conversationRepo.findAll(); }

    public Conversation findById(Long id) {
        return conversationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", id));
    }

    public Conversation create(Conversation conversation) { return conversationRepo.save(conversation); }

    public Conversation update(Long id, Conversation conversation) {
        return conversationRepo.findById(id).map(existing -> {
            existing.setUser(conversation.getUser());
            existing.setLesson(conversation.getLesson());
            existing.setStartedAt(conversation.getStartedAt());
            return conversationRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", id));
    }

    public void delete(Long id) { conversationRepo.deleteById(id); }

    /**
     * دالة لإدارة رقم المحادثة.
     * إذا تم تمرير ID فارغ، تقوم بإنشاء محادثة جديدة في قاعدة البيانات وترجع الـ ID الجديد.
     * إذا تم تمرير ID موجود، ترجعه كما هو.
     */
    @Transactional
    public String getOrCreateConversationId(Long userId, Long lessonId, String conversationId) {
        // إذا كان هناك رقم محادثة مرسل من الواجهة، نستخدمه مباشرة
        if (StringUtils.hasText(conversationId)) {
            return conversationId;
        }

        // إذا لم يكن هناك رقم، ننشئ محادثة جديدة
        Conversation newConv = new Conversation();
        newConv.setUser(userRepo.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found")));
        newConv.setLesson(lessonRepo.findById(lessonId).orElseThrow(() -> new EntityNotFoundException("Lesson not found")));
        newConv.setStartedAt(LocalDateTime.now());

        Conversation savedConv = conversationRepo.save(newConv);
        return String.valueOf(savedConv.getId()); // إرجاع المعرف الحقيقي من MySQL
    }
}
