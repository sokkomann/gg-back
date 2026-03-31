package com.app.globalgates.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/estimation/**")
public class EstimationController {
    @GetMapping("list")
    public String goToList() {
        return "estimation/estimation-list";
    }

    @GetMapping("regist")
    public String goToRegist() {
        return "estimation/estimation-regist";
    }
}
