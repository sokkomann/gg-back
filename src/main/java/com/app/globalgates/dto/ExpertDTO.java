package com.app.globalgates.dto;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class ExpertDTO {
    private Long id;
    private String memberNickname;
    private String memberHandle;
    private String memberBio;
    private String memberProfileFileName;

    // 지금 로그인된 멤버랑 연결여부
    private boolean isConnected;

    // 누구누구님이 팔로우중 입니다 같은거
    private String followerIntro;
}
