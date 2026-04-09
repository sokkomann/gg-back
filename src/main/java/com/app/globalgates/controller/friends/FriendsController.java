package com.app.globalgates.controller.friends;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Duration;

@Controller
@RequiredArgsConstructor
public class FriendsController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("/friends")
    public String goToFriends(HttpServletRequest request, Model model) {
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);

            MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
                } catch (Exception e) {
                    member.setFileName(null);
                }
            }
            model.addAttribute("member", member);
        } catch (Exception ignored) {}

        return "Friends/Friends";
    }
}
