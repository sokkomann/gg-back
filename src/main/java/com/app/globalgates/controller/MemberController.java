package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
//import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.MemberService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/member/**")
@RequiredArgsConstructor
@Slf4j
public class MemberController {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletResponse response;


//    회원가입
    @GetMapping("join")
    public String goToJoinForm(){
        return "member/join";
    }

    @PostMapping("register")
    @ResponseBody
    public void join(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file){
        log.info("memberDTO {}", memberDTO);
        if (file != null && !file.isEmpty()) {
            memberService.join(memberDTO, file);
        } else {
            memberService.join(memberDTO, null);
        }
    }

//        로그인
    @GetMapping("login")
    public String login(@CookieValue(value="remember", required = false) boolean remember,
                        @CookieValue(value="rememberEmail", required = false) String rememberEmail,
                        Model model){
        model.addAttribute("remember", remember);
        model.addAttribute("rememberEmail", rememberEmail);
        return "member/join";
    }

    @PostMapping("login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO){
        log.info("memberDTO: {}", memberDTO);
        try{
            Map<String, String> tokenMap = new HashMap<>();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(memberDTO.getLoginId(),memberDTO.getMemberPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authentication: {}", (CustomUserDetails) authentication.getPrincipal());

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getLoginId());
            jwtTokenProvider.createRefreshToken(memberDTO.getLoginId());

            tokenMap.put("accessToken", accessToken);

            Cookie rememberLoginIdCookie = new Cookie("rememberLoginId", memberDTO.getLoginId());

            rememberLoginIdCookie.setPath("/");
            rememberLoginIdCookie.setMaxAge(60 * 60 * 24 * 30);
            response.addCookie(rememberLoginIdCookie);

            return ResponseEntity.ok(tokenMap);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인실패 : " + e.getMessage()));
        }
    }




}

















