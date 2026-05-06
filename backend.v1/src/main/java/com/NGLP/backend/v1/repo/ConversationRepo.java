package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepo extends JpaRepository<Conversation, Long> {
}
