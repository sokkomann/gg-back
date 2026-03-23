package com.app.globalgates.controller.explore;

import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.dto.RankedSearchHistoryDTO;
import com.app.globalgates.service.NewsService;
import com.app.globalgates.service.PostProductService;
import com.app.globalgates.service.SearchService;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class ExploreAPIController implements ExploreAPIControllerDocs {
    private final PostProductService postProductService;
    private final NewsService newsService;
    private final SearchService searchService;

//    추천 상품 목록 조회
    @GetMapping("products/{page}")
    public ResponseEntity<?> getRecommends(@PathVariable int page) {
        PostProductWithPagingDTO posts = postProductService.getRecommendProducts(page);
        return ResponseEntity.ok(posts);
    }

//    뉴스 목록 조회
    @GetMapping("news")
    public ResponseEntity<?> getNews() {
        List<NewsDTO> newsList = newsService.getNewsList();
        newsList.forEach(news -> {
            news.setCreatedDatetime(DateUtils.toRelativeTime(news.getCreatedDatetime()));
        });
        return ResponseEntity.ok(newsList);
    }

//    실시간 검색어 순위 조회 (10위 까지만)
    @GetMapping("trends")
    public ResponseEntity<?> getTrends() {
        List<RankedSearchHistoryDTO> trends = searchService.getTop10Histories();
        return ResponseEntity.ok(trends);
    }

}
