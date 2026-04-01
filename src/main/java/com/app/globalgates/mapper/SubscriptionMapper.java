package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.dto.SubscriptionDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubscriptionMapper {
    //    구독 등록 (useGeneratedKeys로 ID 세팅)
    public void insert(SubscriptionDTO subscriptionDTO);

    //    회원 id로 활성 구독 조회
    public Optional<SubscriptionDTO> selectByMemberId(Long memberId);

    //    구독 월간->연간으로 변경시 (만료일은 started_at 기준)
    void updateTierToAnnual(@Param("id") Long id, @Param("tier") SubscriptionTier tier, @Param("billingCycle") String billingCycle);

    //    구독 변경시(업글시) 티어만 변경 혹은 유지
    void updateTierOnly(@Param("id") Long id, @Param("tier") SubscriptionTier tier, @Param("billingCycle") String billingCycle);

    //    구독 상태 변경
    public void updateStatus(@Param("id") Long id, @Param("status") SubscriptionStatus status);

    //    [쿼츠관련]
    //    구독 끝난 멤버들 조회
    public List<SubscriptionDTO> selectExpiredMembers();

    public void updateQuartz(@Param("id") Long id, @Param("quartz") boolean quartz);

    public void updateSubscribe(Long id);
}
