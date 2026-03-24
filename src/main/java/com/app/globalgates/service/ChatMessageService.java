package com.app.globalgates.service;

import com.app.globalgates.dto.ChatMessageDTO;
import com.app.globalgates.repository.ChatMessageDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
    private final ChatMessageDAO chatMessageDAO;

//    대화 내역 조회
    public List<ChatMessageDTO> getMessages(Long conversationId, Long memberId) {
        log.info("대화 내역 조회 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatMessageDAO.findAllByConversationId(conversationId, memberId);
    }

//    내 계정에서만 메시지 삭제
    public void deleteMessageForMember(Long messageId, Long memberId) {
        chatMessageDAO.softDeleteForMember(messageId, memberId);
    }
}
