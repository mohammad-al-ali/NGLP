package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.Conversation;
import com.NGLP.backend.v1.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) { this.conversationService = conversationService; }

    @GetMapping
    public List<Conversation> getAll() { return conversationService.findAll(); }

    @GetMapping("/{id}")
    public Conversation getById(@PathVariable Long id) { return conversationService.findById(id); }

    @PostMapping
    public Conversation create(@RequestBody Conversation c) { return conversationService.create(c); }

    @PutMapping("/{id}")
    public Conversation update(@PathVariable Long id, @RequestBody Conversation c) { return conversationService.update(id, c); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        conversationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
