package com.app.globalgates.controller.explore;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.*;
import com.app.globalgates.service.*;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class ExploreAPIController implements ExploreAPIControllerDocs {
    private final PostProductService postProductService;
    private final PostLikeService postLikeService;
    private final BookmarkService bookmarkService;
    private final NewsService newsService;
    private final SearchService searchService;

//    추천 상품 목록 조회
    @GetMapping("products/{page}")
    public ResponseEntity<?> getRecommends(@PathVariable int page,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        PostProductWithPagingDTO posts = postProductService.getRecommendProducts(page, userDetails.getId());
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

    //    좋아요 조회 후, 생성 or 삭제
    @PostMapping("likes/{postId}")
    public ResponseEntity<?> checkLikes(@PathVariable Long postId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<PostLikeDTO> exising = postLikeService.getLike(userDetails.getId(), postId);
        if(!exising.isPresent()) {
            PostLikeDTO postLikeDTO = new PostLikeDTO();
            postLikeDTO.setMemberId(userDetails.getId());
            postLikeDTO.setPostId(postId);
            postLikeService.addLike(postLikeDTO);

            return ResponseEntity.ok("좋아요를 생성했습니다.");
        } else {
            postLikeService.deleteLike(userDetails.getId(), postId);
            return ResponseEntity.ok("좋아요를 삭제했습니다.");
        }
    }

    // 북마크 조회 후, 생성 or 삭제
    @PostMapping("/api/explore/bookmarks/{postId}")
    public ResponseEntity<?> checkBookmarks(@PathVariable Long postId,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<BookmarkDTO> exising = bookmarkService.getBookmark(userDetails.getId(), postId);
        log.info("정보가 바인딩이 되었나?? : {}", exising);

        if(!exising.isPresent()) {
            BookmarkDTO bookmarkDTO = new BookmarkDTO();
            bookmarkDTO.setPostId(postId);
            bookmarkDTO.setMemberId(userDetails.getId());
            bookmarkDTO.setFolderId(null);
            bookmarkService.addBookmark(bookmarkDTO);

            return ResponseEntity.ok("북마크를 등록했습니다.");
        } else {
            bookmarkService.deleteBookmark(exising.get().getId());
            return ResponseEntity.ok("북마크를 제거했습니다.");
        }
    }

}
