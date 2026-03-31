package com.app.globalgates.controller;

import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.service.EstimationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/estimations/**")
public class EstimationAPIController {
    private final EstimationService estimationService;

    @PostMapping("write")
    public void write(@RequestBody EstimationDTO estimationDTO) {
        estimationService.write(estimationDTO);
    }

    @GetMapping("list/{page}")
    public EstimationWithPagingDTO getList(@PathVariable int page) {
        return estimationService.getList(page);
    }

    @GetMapping("{id}")
    public EstimationDTO getDetail(@PathVariable Long id) {
        return estimationService.getDetail(id).orElse(null);
    }
}
