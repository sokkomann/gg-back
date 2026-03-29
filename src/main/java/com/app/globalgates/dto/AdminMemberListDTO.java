package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.MemberRole;
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
public class AdminMemberListDTO {
    private Long id;
    private String memberName;
    private String memberEmail;
    private String companyName;
    private MemberRole memberRole;
    private Status memberStatus;
    private String createdDatetime;
}
