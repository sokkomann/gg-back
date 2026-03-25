package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.InquiryMemberWithPagingDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inqury/**")
@RequiredArgsConstructor
@Slf4j
public class InquiryAPIController {
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("member-list/{page}")
    public ResponseEntity<?> getInquiryMembers(@PathVariable int page, String categoryName,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        InquiryMemberWithPagingDTO inquiryDTO = memberService.getInquiryMembers(page, categoryName, userDetails.getId());
        inquiryDTO.getMembers().forEach(inquiryMemberDTO -> {
            try {
                inquiryMemberDTO.setFilePath(s3Service.getPresignedUrl(inquiryMemberDTO.getFilePath(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        return ResponseEntity.ok(inquiryDTO);
    }
}
