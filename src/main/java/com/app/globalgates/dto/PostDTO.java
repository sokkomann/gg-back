
package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.domain.PostVO;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private Long memberId;
    private Status postStatus;
    private String postTitle;
    private String postContent;
    private String location;
    private Long replyPostId;
    private String createdDatetime;
    private String updatedDatetime;

    // 멤버
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;

    // 좋아요,댓글개수
    private int likeCount;
    private int replyCount;

    // 북마크 여부
    private boolean isBookmarked;

    // 첨부파일
    private List<PostFileDTO> postFiles = new ArrayList<>();
    private String[] fileIdsToDelete;

    public PostVO toPostVO() {
        return PostVO.builder()
                .id(id)
                .memberId(memberId)
                .postStatus(postStatus)
                .postTitle(postTitle)
                .postContent(postContent)
                .location(location)
                .replyPostId(replyPostId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
