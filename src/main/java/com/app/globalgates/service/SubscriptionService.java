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

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class SubscriptionService {
    private final SubscriptionDAO subscriptionDAO;
    private final MemberDAO memberDAO;
    private final BadgeDAO badgeDAO;

    //    검사
    public void managingSchedule() {
        List<SubscriptionDTO> checkSubList = subscriptionDAO.findExpiredMembers();
        checkSubList.forEach((each) -> {
            if(each.isQuartz() && each.getBillingCycle().equals("monthly")){
                log.info("월갱신 들어옴");
                subscriptionDAO.setExpiresAt(each.getId());
                log.info("30일 갱신됨");
            }

            else {
                log.info("만료들어옴");
                subscriptionDAO.setStatus(each.getId(), SubscriptionStatus.EXPIRED);
                badgeDAO.deleteByMemberId(each.getMemberId());
                memberDAO.setMemberRole(each.getMemberId(), MemberRole.BUSINESS);
                log.info("만료");
            }
        }

        );
    }

    //    월별 구독자 해지
    public void cancel(Long id, Long memberId) {
        Optional<SubscriptionDTO> willCancelMember = subscriptionDAO.findByMemberId(memberId);
            if (willCancelMember.get().getBillingCycle().equals("annual")) {
                throw new RuntimeException("연간 구독은 해지 불가입니다.");
            }
            log.info("구독해지 들어옴");
            subscriptionDAO.setQuartz(id, false);
            log.info("구독해지 완료. 쿼츠 false로 세팅.");
    }

    //    구독 + badge + member_role (ID 반환)
    public Long subscribe(SubscriptionDTO subscriptionDTO) {
        log.info("들어옴1");
        subscriptionDTO.setStatus(SubscriptionStatus.ACTIVE);
        subscriptionDAO.save(subscriptionDTO);
        log.info("들어옴2");

        Long memberId = subscriptionDTO.getMemberId();
        SubscriptionTier tier = subscriptionDTO.getTier();

        //    expert 구독은 member_role을 expert로 변경
        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
            log.info("expert구독 들어옴");
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

        log.info("들어옴3");
        return subscriptionDTO.getId();
    }

    //    로그인한사람 어떤 구독인지조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionDAO.findByMemberId(memberId);
    }

    //    구독 플랜변경 경우의수 7개임. 필요에따라 tier, billingCycle, member_role, badge 변경
    public void changePlan(Long id, Long memberId, SubscriptionTier tier, String billingCycle, String expiresAt) {
        log.info("구독변경 들어옴1");
        //    하위 플랜으로 변경 차단
        SubscriptionDTO current = subscriptionDAO.findByMemberId(memberId)
                .orElseThrow(() -> new RuntimeException("구독 정보 없음"));
        log.info("구독변경 들어옴2");
        boolean isUpgrade = false;
        switch (current.getTier()) {
            case FREE:
                isUpgrade = (tier == SubscriptionTier.PRO || tier == SubscriptionTier.PRO_PLUS || tier == SubscriptionTier.EXPERT);
                break;
            case PRO:
                isUpgrade = (tier == SubscriptionTier.PRO || tier == SubscriptionTier.PRO_PLUS || tier == SubscriptionTier.EXPERT);
                break;
            case PRO_PLUS:
                isUpgrade = (tier == SubscriptionTier.PRO_PLUS || tier == SubscriptionTier.EXPERT);
                break;
            case EXPERT:
                isUpgrade = false;
                break;
        }
        if (!isUpgrade) {
            throw new RuntimeException("하위 플랜으로 변경할 수 없습니다");
        }
        // 연간 구독자는 월간으로 변경 불가
        if ("annual".equals(current.getBillingCycle()) && "monthly".equals(billingCycle)) {
            throw new RuntimeException("연간에서 월간 이동은 불가합니다.");
        }
        log.info("구독변경 들어옴3");
        // 월간→연간 업글시 만료일은 started_at 기준 1년
        if ("monthly".equals(current.getBillingCycle()) && "annual".equals(billingCycle)) {
            log.info("구독변경 들어옴4 월간->연간으로 이동함");
            subscriptionDAO.setTierToAnnual(id, tier, billingCycle);
        } else {
            log.info("구독변경 들어옴4-2 월간->월간 아니면 연간->연간으로 이동함");
            subscriptionDAO.setTierOnly(id, tier, billingCycle);
        }

        if (tier == SubscriptionTier.EXPERT) {
            log.info("구독변경5 전문가 등급을 고름");
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
        } else {
            log.info("구독변경5-2 프로/프로+ 등급을 고름");
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
        }
    }

}
