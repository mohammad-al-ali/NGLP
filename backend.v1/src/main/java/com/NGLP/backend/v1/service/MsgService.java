package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Msg;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.MsgRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MsgService {
    private final MsgRepo msgRepo;

    public MsgService(MsgRepo msgRepo) { this.msgRepo = msgRepo; }

    public List<Msg> findAll() { return msgRepo.findAll(); }

    public Msg findById(Long id) {
        return msgRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Msg", "id", id));
    }

    public Msg create(Msg message) { return msgRepo.save(message); }

    public Msg update(Long id, Msg message) {
        return msgRepo.findById(id).map(existing -> {
            existing.setConversation(message.getConversation());
            existing.setSenderType(message.getSenderType());
            existing.setVideoTimestamp(message.getVideoTimestamp());
            existing.setContent(message.getContent());
            existing.setSentAt(message.getSentAt());
            return msgRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Msg", "id", id));
    }

    public void delete(Long id) { msgRepo.deleteById(id); }
}
