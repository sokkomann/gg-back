package com.app.globalgates.controller.inquiry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/inquiry/activity")
@RequiredArgsConstructor
@Slf4j
public class InquiryActivityController {

    @GetMapping("/list")
    public String goToInquiryActivityList() {
        return "Inquiry/inquiry_active_list";
    }
}
