package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.PaymentStatus;
import lombok.*;

@Getter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class PaymentSubscribeVO {
    private Long id;
    private Long subscriptionId;
    private Long memberId;
    private Long amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String receiptId;
    private String paidAt;
    private String createdDatetime;
}
