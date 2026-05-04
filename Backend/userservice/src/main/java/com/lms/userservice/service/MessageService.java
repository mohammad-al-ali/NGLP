package com.lms.userservice.service;

@Service
public class MessageService {
    @Autowired private MessageRepository messageRepository;

    public Message sendMessage(Message message) {
        message.setTimestamp(LocalDateTime.now()); // ضبط الوقت تلقائياً
        return messageRepository.save(message);
    }
    public List<Message> getMessagesByConversation(Long convId) { 
        return messageRepository.findByConversationIdOrderByTimestampAsc(convId); 
    }
}
