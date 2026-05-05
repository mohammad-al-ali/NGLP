package com.NGLP.backend.v1.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Msg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    private String senderType; // "USER" , "AI"
    private Integer videoTimestamp;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime sentAt;
}
