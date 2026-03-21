package com.app.globalgates.controller;

import com.app.globalgates.dto.MemberDTO;
//import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequestMapping("/member/**")
@RequiredArgsConstructor
@Slf4j
public class MemberController {
    private final MemberService memberService;


//    회원가입
    @GetMapping("join")
    public String goToJoinForm(){
        return "member/join";
    }

    @PostMapping("register")
    @ResponseBody
    public void join(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file){
        log.info("memberDTO {}", memberDTO);
        memberService.join(memberDTO,file);
    }

//    로그인
    @GetMapping("login")
    public String login(@CookieValue(value="remember", required = false) boolean remember,
                        @CookieValue(value="rememberEmail", required = false) String rememberEmail,
                        Model model){
        model.addAttribute("remember", remember);
        model.addAttribute("rememberEmail", rememberEmail);
        return "member/join";
    }

}

















