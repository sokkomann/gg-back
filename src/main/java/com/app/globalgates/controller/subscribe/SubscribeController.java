package com.app.globalgates.controller.subscribe;

import com.app.globalgates.auth.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class SubscribeController {
    @GetMapping("/subscribe")
    public String goToSubscribe(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        model.addAttribute("memberId", userDetails.getId());
        return "Subscribe/Subscribe";
    }
}
