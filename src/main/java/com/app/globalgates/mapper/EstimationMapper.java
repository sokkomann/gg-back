package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationTagDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface EstimationMapper {
    void insert(EstimationDTO estimationDTO);

    int selectTotal();

    List<EstimationDTO> selectAll(@Param("criteria") Criteria criteria);

    Optional<EstimationDTO> selectById(Long id);

    void insertTag(EstimationTagDTO estimationTagDTO);

    Optional<EstimationTagDTO> selectTagByName(String tagName);

    List<EstimationTagDTO> selectAllTagsByEstimationId(Long estimationId);

    void insertTagRel(@Param("estimationId") Long estimationId, @Param("tagId") Long tagId);
}
