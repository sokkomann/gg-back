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
import org.springframework.cache.annotation.CacheEvict;
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
    @CacheEvict(value = {"post:list", "post", "community:post:list", "member", "community:member:list"}, allEntries = true)
    public void managingSchedule() {
        List<SubscriptionDTO> checkSubList = subscriptionDAO.findExpiredMembers();
        checkSubList.forEach((each) -> {
            //    다음 플랜이 예약되어 있으면 -> 현재 구독 만료후에 새 구독 생성
            if(each.getNextTier() != null && !each.getNextTier().isEmpty()){
                log.info("플랜변경 예약 들어옴 nextTier {}", each.getNextTier());
                //    현재 구독 만료 처리
                subscriptionDAO.setStatus(each.getId(), SubscriptionStatus.EXPIRED);
                log.info("현재 구독 만료");

                //    새 구독 생성
                SubscriptionDTO newSub = new SubscriptionDTO();
                newSub.setMemberId(each.getMemberId());
                newSub.setTier(SubscriptionTier.getSubscriptionTier(each.getNextTier()));
                newSub.setBillingCycle(each.getNextBillingCycle());
                newSub.setStatus(SubscriptionStatus.ACTIVE);
                subscriptionDAO.save(newSub);
                log.info("새 구독 생성 완료 tier {}", each.getNextTier());

                //    뱃지/role 업데이트
                SubscriptionTier newTier = SubscriptionTier.getSubscriptionTier(each.getNextTier());
                if (newTier == SubscriptionTier.EXPERT) {
                    memberDAO.setMemberRole(each.getMemberId(), MemberRole.EXPERT);
                } else {
                    memberDAO.setMemberRole(each.getMemberId(), MemberRole.BUSINESS);
                }

                if (newTier != SubscriptionTier.FREE) {
                    BadgeType badgeType = BadgeType.getBadgeType(newTier.getValue());
                    Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(each.getMemberId());
                    if (existingBadge.isPresent()) {
                        badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
                    } else {
                        badgeDAO.save(BadgeVO.builder()
                                .memberId(each.getMemberId())
                                .badgeType(badgeType)
                                .build());
                    }
                }
                log.info("플랜변경 '완'");
            }
            //    월간갱신 (quartz=true) -> 만료일 갱신
            else if(each.isQuartz() && each.getBillingCycle().equals("monthly")){
                log.info("월갱신 들어옴");
                subscriptionDAO.setExpiresAt(each.getId());
                log.info("30일 갱신됨");
            }
            //    그 외 -> 만료 처리
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
            //    플랜변경 예약이 있었다면 초기화
            subscriptionDAO.setNextPlan(id, null, null);
            log.info("구독해지 '완'. 쿼츠 false로 세팅. next_plan 초기화.");
    }

    //    구독 + badge + member_role (ID 반환)
    @CacheEvict(value = {"post:list", "post", "community:post:list", "member", "community:member:list"}, allEntries = true)
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

    //    플랜 변경 예약 (만료 후 새 플랜으로 전환)
    public void changePlan(Long id, Long memberId, String nextTier, String nextBillingCycle) {
        log.info("플랜변경예약 들어옴1");
        SubscriptionDTO current = subscriptionDAO.findByMemberId(memberId)
                .orElseThrow(() -> new RuntimeException("구독 정보 없음"));
        log.info("플랜변경예약 들어옴2 현재구독={}", current);

        //    월간→연간 변경 차단
        if ("monthly".equals(current.getBillingCycle()) && "annual".equals(nextBillingCycle)) {
            throw new RuntimeException("월간에서 연간으로 변경할 수 없습니다. 현재 구독 만료 후 연간을 이용해주세요.");
        }
        log.info("플랜변경예약 들어옴3");

        //    next_tier, next_billing_cycle 저장 (만료 시 쿼츠가 처리)
        subscriptionDAO.setNextPlan(id, nextTier, nextBillingCycle);
        //    자동갱신 중지 (현재 플랜 만료 후 새 플랜으로 전환되도록)
        subscriptionDAO.setQuartz(id, false);
        log.info("플랜변경예약 완료 nextTier={}, nextBillingCycle={}", nextTier, nextBillingCycle);
    }

}
