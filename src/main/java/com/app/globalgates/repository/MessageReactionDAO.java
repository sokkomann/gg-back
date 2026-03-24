package com.app.globalgates.repository;

import com.app.globalgates.dto.MessageReactionDTO;
import com.app.globalgates.mapper.MessageReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MessageReactionDAO {
    private final MessageReactionMapper messageReactionMapper;

//    반응 추가
    public MessageReactionDTO save(MessageReactionDTO messageReactionDTO) {
        messageReactionMapper.insert(messageReactionDTO);
        return messageReactionDTO;
    }

//    반응 삭제
    public void delete(Long messageId, Long memberId, String emoji) {
        messageReactionMapper.delete(messageId, memberId, emoji);
    }

//    메시지별 반응 조회
    public List<MessageReactionDTO> findAllByMessageId(Long messageId) {
        return messageReactionMapper.selectAllByMessageId(messageId);
    }
}
