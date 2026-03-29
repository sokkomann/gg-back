package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.ReportStatus;
import com.app.globalgates.common.enumeration.ReportTargetType;
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
public class AdminReportListDTO {
    private Long id;
    private String reporterName;
    private ReportTargetType targetType;
    private String targetName;
    private String reason;
    private ReportStatus status;
    private String createdDatetime;
}
