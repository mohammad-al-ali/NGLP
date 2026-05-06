package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.Msg;
import com.NGLP.backend.v1.service.MsgService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MsgController {
    private final MsgService messageService;

    public MsgController(MsgService messageService) { this.messageService = messageService; }

    @GetMapping
    public List<Msg> getAll() { return messageService.findAll(); }

    @GetMapping("/{id}")
    public Msg getById(@PathVariable Long id) { return messageService.findById(id); }

    @PostMapping
    public Msg create(@RequestBody Msg m) { return messageService.create(m); }

    @PutMapping("/{id}")
    public Msg update(@PathVariable Long id, @RequestBody Msg m) { return messageService.update(id, m); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        messageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
