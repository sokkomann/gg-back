package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.AdminMemberListDTO;
import com.app.globalgates.dto.AdminPostListDTO;
import com.app.globalgates.dto.AdminReportListDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    int selectAdminMemberTotal(@Param("keyword") String keyword,
                               @Param("memberRole") String memberRole,
                               @Param("memberStatus") String memberStatus);

    List<AdminMemberListDTO> selectAdminMembers(@Param("criteria") Criteria criteria,
                                                @Param("keyword") String keyword,
                                                @Param("memberRole") String memberRole,
                                                @Param("memberStatus") String memberStatus);

    int selectAdminPostTotal(@Param("keyword") String keyword,
                             @Param("postType") String postType,
                             @Param("categoryName") String categoryName,
                             @Param("postStatus") String postStatus);

    List<AdminPostListDTO> selectAdminPosts(@Param("criteria") Criteria criteria,
                                            @Param("keyword") String keyword,
                                            @Param("postType") String postType,
                                            @Param("categoryName") String categoryName,
                                            @Param("postStatus") String postStatus);

    int selectAdminReportTotal(@Param("keyword") String keyword,
                               @Param("targetType") String targetType,
                               @Param("reportStatus") String reportStatus);

    List<AdminReportListDTO> selectAdminReports(@Param("criteria") Criteria criteria,
                                                @Param("keyword") String keyword,
                                                @Param("targetType") String targetType,
                                                @Param("reportStatus") String reportStatus);
}
