package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.repo.ConversationRepo;
import com.NGLP.backend.v1.repo.LessonRepo;
import com.NGLP.backend.v1.repo.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepo conversationRepo;
    private final UserRepo userRepo;
    private final LessonRepo lessonRepo;

    /**
     * الدالة الجوهرية (Business Logic):
     * نبحث عن محادثة سابقة للطالب في هذا الدرس، إذا لم نجدها، ننشئ واحدة جديدة فوراً.
     * هذا يجعل الواجهة الأمامية (React) مرتاحة جداً!
     */
    @Transactional
    public Conversation getOrCreateConversation(Long userId, Long lessonId) {
        return conversationRepo.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setUser(userRepo.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found")));
                    newConv.setLesson(lessonRepo.findById(lessonId).orElseThrow(() -> new EntityNotFoundException("Lesson not found")));
                    newConv.setStartedAt(LocalDateTime.now());
                    return conversationRepo.save(newConv);
                });
    }

    // نحتاج هذه الدالة إذا أراد المستخدم حذف تاريخ الدردشة الخاص به في هذا الدرس
    public void delete(Long id) {
        conversationRepo.deleteById(id);
    }
}