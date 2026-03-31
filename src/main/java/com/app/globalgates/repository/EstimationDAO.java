package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
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

    public int findTotal() {
        return estimationMapper.selectTotal();
    }

    public List<EstimationDTO> findAll(Criteria criteria) {
        return estimationMapper.selectAll(criteria);
    }

    public Optional<EstimationDTO> findById(Long id) {
        return estimationMapper.selectById(id);
    }
}
