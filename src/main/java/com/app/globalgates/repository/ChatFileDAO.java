package com.app.globalgates.repository;

import com.app.globalgates.mapper.ChatFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatFileDAO {
    private final ChatFileMapper chatFileMapper;

    public void save(Long fileId, Long messageId) {
        chatFileMapper.insert(fileId, messageId);
    }
}
