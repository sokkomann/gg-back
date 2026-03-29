package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.AdminMemberListDTO;
import com.app.globalgates.dto.AdminMemberWithPagingDTO;
import com.app.globalgates.dto.AdminPostListDTO;
import com.app.globalgates.dto.AdminPostWithPagingDTO;
import com.app.globalgates.dto.AdminReportListDTO;
import com.app.globalgates.dto.AdminReportWithPagingDTO;
import com.app.globalgates.repository.AdminDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminDAO adminDAO;

    public AdminMemberWithPagingDTO getAdminMembers(int page, String keyword, String memberRole, String memberStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminMemberTotal(keyword, memberRole, memberStatus));
        List<AdminMemberListDTO> members = adminDAO.findAdminMembers(criteria, keyword, memberRole, memberStatus);

        criteria.setHasMore(members.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            members.remove(members.size() - 1);
        }

        AdminMemberWithPagingDTO result = new AdminMemberWithPagingDTO();
        result.setMembers(members);
        result.setCriteria(criteria);
        return result;
    }

    public AdminPostWithPagingDTO getAdminPosts(int page, String keyword, String postType, String categoryName, String postStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminPostTotal(keyword, postType, categoryName, postStatus));
        List<AdminPostListDTO> posts = adminDAO.findAdminPosts(criteria, keyword, postType, categoryName, postStatus);

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        AdminPostWithPagingDTO result = new AdminPostWithPagingDTO();
        result.setPosts(posts);
        result.setCriteria(criteria);
        return result;
    }

    public AdminReportWithPagingDTO getAdminReports(int page, String keyword, String targetType, String reportStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminReportTotal(keyword, targetType, reportStatus));
        List<AdminReportListDTO> reports = adminDAO.findAdminReports(criteria, keyword, targetType, reportStatus);

        criteria.setHasMore(reports.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            reports.remove(reports.size() - 1);
        }

        AdminReportWithPagingDTO result = new AdminReportWithPagingDTO();
        result.setReports(reports);
        result.setCriteria(criteria);
        return result;
    }
}
