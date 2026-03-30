package com.app.globalgates.controller.friends;

import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.service.FriendsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendsAPIController {
    private final FriendsService friendsService;
    private final CategoryDAO categoryDAO;

    @GetMapping("/list/{page}")
    public FriendsWithPagingDTO getList(@PathVariable int page, @RequestParam Long memberId, @RequestParam(required = false) Long categoryId) {
        log.info("친구 추천 목록 조회 — page: {}, memberId: {}, categoryId: {}", page, memberId, categoryId);
        return friendsService.getList(page, memberId, categoryId);
    }

    @GetMapping("/categories")
    public List<CategoryDTO> getCategories() {
        log.info("카테고리 목록 조회");
        return categoryDAO.findAll();
    }
}
