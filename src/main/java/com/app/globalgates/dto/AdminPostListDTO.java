package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.Status;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class AdminPostListDTO {
    private Long id;
    private Long memberId;
    private String authorName;
    private String postTitle;
    private String postContent;
    private String postType;
    private String categoryName;
    private Status postStatus;
    private String createdDatetime;
}
