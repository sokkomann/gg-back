package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationExpertDTO;
import com.app.globalgates.mapper.EstimationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EstimationDAO {
    private final EstimationMapper estimationMapper;

    public void save(EstimationDTO estimationDTO) {
        estimationMapper.insert(estimationDTO);
    }

    public int findTotal(Long receiverId) {
        return estimationMapper.selectTotal(receiverId);
    }

    public List<EstimationDTO> findAll(Criteria criteria, Long receiverId) {
        return estimationMapper.selectAll(criteria, receiverId);
    }

    public int findRequestedTotal(Long requesterId) {
        return estimationMapper.selectRequestedTotal(requesterId);
    }

    public List<EstimationDTO> findRequestedAll(Criteria criteria, Long requesterId) {
        return estimationMapper.selectRequestedAll(criteria, requesterId);
    }

    public Optional<EstimationDTO> findById(Long id) {
        return estimationMapper.selectById(id);
    }

    public List<EstimationExpertDTO> findExpertsForRequest(Long memberId, String keyword) {
        return estimationMapper.selectExpertsForRequest(memberId, keyword);
    }
}
