package com.app.globalgates.controller.admin;

import com.app.globalgates.dto.AdminMemberWithPagingDTO;
import com.app.globalgates.dto.AdminPostWithPagingDTO;
import com.app.globalgates.dto.AdminReportWithPagingDTO;
import com.app.globalgates.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAPIController {
    private final AdminService adminService;

    @GetMapping("/members/{page}")
    public ResponseEntity<AdminMemberWithPagingDTO> getAdminMembers(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String memberRole,
            @RequestParam(required = false) String memberStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminMembers(page, keyword, memberRole, memberStatus));
    }

    @GetMapping("/posts/{page}")
    public ResponseEntity<AdminPostWithPagingDTO> getAdminPosts(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String postType,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String postStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminPosts(page, keyword, postType, categoryName, postStatus));
    }

    @GetMapping("/reports/{page}")
    public ResponseEntity<AdminReportWithPagingDTO> getAdminReports(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String reportStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminReports(page, keyword, targetType, reportStatus));
    }
}
