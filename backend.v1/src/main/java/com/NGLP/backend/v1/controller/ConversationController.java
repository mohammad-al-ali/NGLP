package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    /**
     * نقطة الوصول الوحيدة التي نحتاجها فعلياً لتهيئة الدردشة
     * GET /api/v1/conversations/init?userId=1&lessonId=5
     */
    @GetMapping
    public ResponseEntity<Conversation> initConversation(
            @RequestParam Long userId,
            @RequestParam Long lessonId) {

        Conversation conversation = conversationService.getOrCreateConversation(userId, lessonId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * DELETE /api/v1/conversations/10
     * لمسح محادثة معينة (اختياري، ميزة جيدة للطالب)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}