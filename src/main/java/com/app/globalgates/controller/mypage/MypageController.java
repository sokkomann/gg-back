package com.app.globalgates.controller.mypage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/mypage/**")
public class MypageController {

    @GetMapping("/mypage")
    public String goToMypage() {
        return "mypage/mypage";
    }
}
