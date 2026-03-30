package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.BadgeVO;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.repository.BadgeDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.SubscriptionDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class SubscriptionService {
    private final SubscriptionDAO subscriptionDAO;
    private final MemberDAO memberDAO;
    private final BadgeDAO badgeDAO;

    //    구독 등록 + badge + member_role (ID 반환)
    public Long subscribe(SubscriptionDTO subscriptionDTO) {
        log.info("들어옴1");
        subscriptionDTO.setStatus(SubscriptionStatus.ACTIVE);
        subscriptionDAO.save(subscriptionDTO);
        log.info("들어옴2");

        Long memberId = subscriptionDTO.getMemberId();
        SubscriptionTier tier = subscriptionDTO.getTier();

        //    expert 구독 → member_role을 expert로 변경
        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
            log.info("들어옴3");
        }

        //    tier에 따라 badge 부여 (free 제외)
        if (tier != SubscriptionTier.FREE) {
            BadgeType badgeType = BadgeType.getBadgeType(tier.getValue());
            Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(memberId);
            if (existingBadge.isPresent()) {
                badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
            } else {
                badgeDAO.save(BadgeVO.builder()
                        .memberId(memberId)
                        .badgeType(badgeType)
                        .build());
            }
        }

        log.info("들어옴4");
        return subscriptionDTO.getId();
    }

    //    로그인한사람 어떤 구독인지조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionDAO.findByMemberId(memberId);
    }

    //    구독 플랜변경 (tier, billingCycle, expiresAt) + member_role, badge 변경
    public void changePlan(Long id, Long memberId, SubscriptionTier tier, String billingCycle, String expiresAt) {
        subscriptionDAO.updateTier(id, tier, billingCycle, expiresAt);

        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
        } else {
            memberDAO.setMemberRole(memberId, MemberRole.BUSINESS);
        }

        if (tier != SubscriptionTier.FREE) {
            BadgeType badgeType = BadgeType.getBadgeType(tier.getValue());
            Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(memberId);
            if (existingBadge.isPresent()) {
                badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
            } else {
                badgeDAO.save(BadgeVO.builder()
                        .memberId(memberId)
                        .badgeType(badgeType)
                        .build());
            }
        } else {
            badgeDAO.deleteByMemberId(memberId);
        }
    }

    //    구독 해지 = 한달분만 진행하고 member_role을 business로 돌리고 badge 삭제
    //    한달분을 제외한 금액만큼 돌려주기...가 의도인데
    public void cancel(Long id, Long memberId) {
        subscriptionDAO.updateStatus(id, SubscriptionStatus.INACTIVE);
        memberDAO.setMemberRole(memberId, MemberRole.BUSINESS);
        badgeDAO.deleteByMemberId(memberId);
    }
}
