
package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.ExpertDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExpertMapper {
    //    전문가 목록 조회
    public List<ExpertDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    전문가 명수
    public int selectTotal();
}