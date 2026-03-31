-- =============================================
-- 커뮤니티 더미 데이터
-- dummy_data.sql 회원 기준 (kim~noh@test.com)
-- =============================================

-- [1] 커뮤니티 생성 (creator_id는 회원 서브쿼리로)
INSERT INTO tbl_community (creator_id, community_name, description, category_id)
VALUES
    -- 수출 관련
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'),
     '미주 수출 실무 포럼',
     '미국·캐나다·멕시코 수출 실무 경험과 노하우를 나누는 커뮤니티입니다. FDA 인증, 미국 관세, USMCA 활용 전략 등을 함께 논의합니다.',
     (SELECT id FROM tbl_category WHERE category_name = '미주')),

    ((SELECT id FROM tbl_member WHERE member_email = 'han@test.com'),
     'FTA 활용 전략 연구회',
     'FTA 원산지 판정, 협정세율 활용, C/O 발급 등 FTA 실무 전반을 다루는 전문가 커뮤니티. RCEP, 한-EU, 한-아세안 등 주요 협정별 사례를 공유합니다.',
     (SELECT id FROM tbl_category WHERE category_name = 'FTA')),

    ((SELECT id FROM tbl_member WHERE member_email = 'seo@test.com'),
     'K-Food 해외진출 네트워크',
     '한국 식품의 해외 수출을 위한 정보 공유 커뮤니티. HACCP, FDA, HALAL 인증 절차와 일본·동남아 시장 진출 전략을 함께 고민합니다.',
     (SELECT id FROM tbl_category WHERE category_name = '식품')),

    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'),
     'HS코드 & 관세 실무',
     'HS코드 분류, 관세율 확인, 관세 환급, 세관 심사 대응 등 관세 실무 전반을 다루는 커뮤니티입니다.',
     (SELECT id FROM tbl_category WHERE category_name = 'HS코드')),

    ((SELECT id FROM tbl_member WHERE member_email = 'oh@test.com'),
     '국제물류 최적화 그룹',
     '해운·항공·복합운송 물류비 절감, 포워딩 계약, 부산항·인천항 운영 노하우를 공유하는 물류 전문가 모임입니다.',
     (SELECT id FROM tbl_category WHERE category_name = '해운')),

    ((SELECT id FROM tbl_member WHERE member_email = 'shin@test.com'),
     '섬유·의류 수출 트렌드',
     '유럽·일본 SPA 브랜드 OEM 수출, 친환경 소재 트렌드, 바이어 매칭 정보를 공유하는 의류 수출 전문 커뮤니티.',
     (SELECT id FROM tbl_category WHERE category_name = '섬유/의류')),

    ((SELECT id FROM tbl_member WHERE member_email = 'moon@test.com'),
     '신재생에너지 무역 포럼',
     '태양광·풍력 설비 수출입, ESG 무역 트렌드, 탄소국경세 대응 전략 등 에너지 무역 이슈를 논의하는 커뮤니티.',
     (SELECT id FROM tbl_category WHERE category_name = '에너지')),

    ((SELECT id FROM tbl_member WHERE member_email = 'jo@test.com'),
     '전자부품 글로벌 소싱',
     '반도체, 디스플레이, 전자부품의 글로벌 소싱·ODM/OEM 매칭 정보를 공유합니다. 유럽·중동 바이어 네트워크 연결.',
     (SELECT id FROM tbl_category WHERE category_name = '전자부품')),

    ((SELECT id FROM tbl_member WHERE member_email = 'song@test.com'),
     '원산지 관리 실무자 모임',
     '원산지 판정, 증명서 발급, 사후검증 대응 등 원산지 관리 실무를 다루는 커뮤니티. 섬유·의류·화학 업종 사례 중심.',
     (SELECT id FROM tbl_category WHERE category_name = '통관')),

    ((SELECT id FROM tbl_member WHERE member_email = 'noh@test.com'),
     '반도체 수출규제 대응',
     '미국 EAR, 일본 수출규제, EU 반도체법 등 반도체 수출 관련 규제 동향과 컴플라이언스 대응 전략을 공유합니다.',
     (SELECT id FROM tbl_category WHERE category_name = 'IT')),

    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'),
     '통관·보세운송 Q&A',
     '수출입 통관 절차, 보세운송, 관세 심사 대응에 대한 질문과 답변을 나누는 실무 커뮤니티.',
     (SELECT id FROM tbl_category WHERE category_name = '통관')),

    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'),
     '원단 소싱 네트워크',
     '인도·방글라데시·베트남 원단 소싱 정보, 면직물·합성섬유·기능성 원단 거래처 공유 커뮤니티.',
     (SELECT id FROM tbl_category WHERE category_name = '섬유/의류'))
ON CONFLICT DO NOTHING;


-- [2] 커뮤니티 멤버 가입 (생성자는 admin, 나머지는 member)
-- 각 커뮤니티에 생성자 + 여러 멤버 배정

-- 커뮤니티 1: 미주 수출 실무 포럼 (creator: lee)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'lee@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '미주 수출 실무 포럼'
  AND m.member_email IN ('lee@test.com', 'kim@test.com', 'park@test.com', 'kang@test.com', 'han@test.com', 'choi@test.com', 'bae@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 2: FTA 활용 전략 연구회 (creator: han)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'han@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = 'FTA 활용 전략 연구회'
  AND m.member_email IN ('han@test.com', 'lee@test.com', 'choi@test.com', 'song@test.com', 'yoon@test.com', 'seo@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 3: K-Food 해외진출 네트워크 (creator: seo)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'seo@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = 'K-Food 해외진출 네트워크'
  AND m.member_email IN ('seo@test.com', 'kim@test.com', 'lee@test.com', 'jung@test.com', 'lim@test.com', 'kwon@test.com', 'yang@test.com', 'noh@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 4: HS코드 & 관세 실무 (creator: choi)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'choi@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = 'HS코드 & 관세 실무'
  AND m.member_email IN ('choi@test.com', 'han@test.com', 'yoon@test.com', 'song@test.com', 'lee@test.com', 'park@test.com', 'jung@test.com', 'oh@test.com', 'moon@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 5: 국제물류 최적화 그룹 (creator: oh)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'oh@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '국제물류 최적화 그룹'
  AND m.member_email IN ('oh@test.com', 'jung@test.com', 'bae@test.com', 'yang@test.com', 'kwon@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 6: 섬유·의류 수출 트렌드 (creator: shin)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'shin@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '섬유·의류 수출 트렌드'
  AND m.member_email IN ('shin@test.com', 'hwang@test.com', 'song@test.com', 'kang@test.com', 'lim@test.com', 'jo@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 7: 신재생에너지 무역 포럼 (creator: moon)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'moon@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '신재생에너지 무역 포럼'
  AND m.member_email IN ('moon@test.com', 'yang@test.com', 'kwon@test.com', 'noh@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 8: 전자부품 글로벌 소싱 (creator: jo)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'jo@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '전자부품 글로벌 소싱'
  AND m.member_email IN ('jo@test.com', 'noh@test.com', 'kim@test.com', 'park@test.com', 'bae@test.com', 'kang@test.com', 'moon@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 9: 원산지 관리 실무자 모임 (creator: song)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'song@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '원산지 관리 실무자 모임'
  AND m.member_email IN ('song@test.com', 'han@test.com', 'choi@test.com', 'hwang@test.com', 'shin@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 10: 반도체 수출규제 대응 (creator: noh)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'noh@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '반도체 수출규제 대응'
  AND m.member_email IN ('noh@test.com', 'jo@test.com', 'kim@test.com', 'lee@test.com', 'choi@test.com', 'han@test.com', 'moon@test.com', 'park@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 11: 통관·보세운송 Q&A (creator: yoon)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'yoon@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '통관·보세운송 Q&A'
  AND m.member_email IN ('yoon@test.com', 'choi@test.com', 'oh@test.com', 'jung@test.com', 'kwon@test.com', 'seo@test.com')
ON CONFLICT DO NOTHING;

-- 커뮤니티 12: 원단 소싱 네트워크 (creator: hwang)
INSERT INTO tbl_community_member (community_id, member_id, member_role, joined_at)
SELECT c.id, m.id,
       CASE WHEN m.member_email = 'hwang@test.com' THEN 'admin'::community_member_role ELSE 'member'::community_member_role END,
       now() - interval '1 day' * (random() * 30)::int
FROM tbl_community c, tbl_member m
WHERE c.community_name = '원단 소싱 네트워크'
  AND m.member_email IN ('hwang@test.com', 'shin@test.com', 'song@test.com', 'kang@test.com', 'lim@test.com')
ON CONFLICT DO NOTHING;


-- [3] 커뮤니티 게시글 (community_id 연결)
-- 각 커뮤니티 생성자가 작성한 게시글 + 멤버 게시글

-- 커뮤니티 1: 미주 수출 실무 포럼
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active',
     '2026년 미국 관세 인상 품목 정리',
     '올해 미국이 추가 관세를 부과한 품목 리스트를 정리했습니다. 특히 철강·알루미늄 관련 추가 관세가 확대되었으니, 해당 품목 수출 기업은 반드시 확인하시기 바랍니다. 관세율 변경 상세 내용은 USTR 공지를 참고해주세요.',
     (SELECT id FROM tbl_community WHERE community_name = '미주 수출 실무 포럼')),

    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active',
     'USMCA 원산지 규정 변경 사항 안내',
     'USMCA(미국-멕시코-캐나다 협정) 원산지 규정이 2026년부터 일부 변경됩니다. 자동차 부품의 역내 부가가치 비율이 75%로 상향되었고, 철강·알루미늄 원산지 요건이 강화되었습니다. 해당 품목 수출 기업은 원산지 관리 체계를 점검하시기 바랍니다.',
     (SELECT id FROM tbl_community WHERE community_name = '미주 수출 실무 포럼')),

    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active',
     '미국 아마존 FBA 입고 시 통관 팁',
     '미국 아마존 FBA 창고에 직접 입고할 때 통관 과정에서 겪었던 시행착오를 공유합니다. ISF 신고 타이밍, 관세 분류, FDA 사전 신고 등 실무 포인트를 정리했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '미주 수출 실무 포럼')),

    ((SELECT id FROM tbl_member WHERE member_email = 'park@test.com'), 'active',
     '캐나다 바이어 미팅 후기',
     '지난주 토론토에서 진행한 바이어 미팅 후기입니다. 캐나다 시장은 품질 인증을 매우 중시하며, CSA 인증이 사실상 필수입니다. 한국 중소기업이 캐나다 시장에 진출할 때 유의할 점을 정리했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '미주 수출 실무 포럼'));

-- 커뮤니티 2: FTA 활용 전략 연구회
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'han@test.com'), 'active',
     'RCEP 활용 시 주의할 원산지 기준',
     'RCEP은 품목별로 원산지 기준이 다르게 적용됩니다. 특히 섬유·의류 품목은 2공정 기준이 적용되어, 단순 봉제만으로는 원산지를 인정받기 어렵습니다. 주요 품목별 원산지 결정기준을 정리했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'FTA 활용 전략 연구회')),

    ((SELECT id FROM tbl_member WHERE member_email = 'han@test.com'), 'active',
     '한-EU FTA C/O 발급 실무 가이드',
     '한-EU FTA에서는 인증수출자 제도를 통해 자율증명이 가능합니다. 인증수출자 신청 절차, 원산지 소명 자료 준비 방법, 그리고 실제 C/O 발급 시 자주 발생하는 실수와 해결 방법을 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'FTA 활용 전략 연구회')),

    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active',
     'FTA 세율 적용 vs 일반 세율, 어느 게 유리한가?',
     '모든 품목에서 FTA 세율이 유리한 것은 아닙니다. WTO 양허세율이 이미 0%인 품목이나, FTA 원산지 증빙 비용이 관세 절감액보다 큰 경우가 있습니다. 품목별로 비교 검토한 사례를 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'FTA 활용 전략 연구회'));

-- 커뮤니티 3: K-Food 해외진출 네트워크
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'seo@test.com'), 'active',
     '일본 식품 수출 시 필요한 인증 총정리',
     '일본에 식품을 수출하기 위해 필요한 인증과 라벨링 요건을 정리했습니다. 식품위생법, JAS 규격, 영양표시 기준 등을 품목별로 구분하여 안내합니다. 특히 최근 변경된 첨가물 표시 규정에 주의하세요.',
     (SELECT id FROM tbl_community WHERE community_name = 'K-Food 해외진출 네트워크')),

    ((SELECT id FROM tbl_member WHERE member_email = 'seo@test.com'), 'active',
     'HALAL 인증 취득 절차 및 비용 안내',
     '동남아·중동 시장 진출을 위한 HALAL 인증 취득 절차를 정리했습니다. 인증 기관 선택, 현장 심사 준비, 비용 구조, 그리고 갱신 주기까지 실무자가 알아야 할 핵심 사항을 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'K-Food 해외진출 네트워크')),

    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active',
     '베트남 K-Food 전시회 참가 후기',
     '호치민 K-Food 박람회에 참가한 후기입니다. 현지 바이어들의 관심 품목, 가격대 반응, 유통 채널 특성 등을 정리했습니다. 베트남 시장 진출을 고려하시는 분들에게 도움이 되길 바랍니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'K-Food 해외진출 네트워크'));

-- 커뮤니티 4: HS코드 & 관세 실무
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active',
     'HS코드 분류 오류로 인한 관세 추징 사례',
     '최근 HS코드 분류 오류로 관세를 추징당한 사례를 분석했습니다. 특히 전자제품과 기계류에서 자주 발생하는 분류 오류 유형과, 사전심사 제도를 활용한 예방 방법을 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'HS코드 & 관세 실무')),

    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active',
     '관세 환급 신청 실무 체크리스트',
     '수출용 원재료에 대한 관세 환급 신청 시 필요한 서류와 절차를 체크리스트로 정리했습니다. 간이정액환급과 개별환급의 차이, 환급 신청 기한, 그리고 자주 반려되는 사유를 함께 안내합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'HS코드 & 관세 실무')),

    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'), 'active',
     '화장품 HS코드 분류 기준 문의',
     '화장품 수출 시 HS코드 분류가 헷갈리는 부분이 있어 질문 드립니다. 기능성 화장품(자외선 차단, 미백 등)은 의약외품으로 분류되는지, 화장품으로 분류되는지에 따라 세율이 달라지는데, 실무에서 어떻게 판단하시는지 의견 부탁합니다.',
     (SELECT id FROM tbl_community WHERE community_name = 'HS코드 & 관세 실무'));

-- 커뮤니티 5: 국제물류 최적화 그룹
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'oh@test.com'), 'active',
     '부산항 컨테이너 선적 지연 대응 방안',
     '최근 부산항에서 컨테이너 선적 지연이 빈번하게 발생하고 있습니다. 주요 원인과 함께, 포워더와 협의하여 지연을 최소화할 수 있는 실무 대응 방안을 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '국제물류 최적화 그룹')),

    ((SELECT id FROM tbl_member WHERE member_email = 'oh@test.com'), 'active',
     '해운 vs 항공 운송 비용 비교 (2026년 상반기)',
     '2026년 상반기 기준 주요 노선별 해운·항공 운송비를 비교 정리했습니다. 유럽, 미주, 동남아 노선의 운임 동향과 함께, 긴급 화물 발생 시 최적의 운송 모드를 선택하는 기준을 제시합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '국제물류 최적화 그룹'));

-- 커뮤니티 6: 섬유·의류 수출 트렌드
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'shin@test.com'), 'active',
     '2026 S/S 유럽 SPA 브랜드 트렌드 분석',
     '올해 유럽 SPA 브랜드의 S/S 시즌 트렌드를 분석했습니다. 친환경 소재 사용 비율이 전년 대비 30% 증가했고, 리사이클 폴리에스터와 오가닉 코튼 수요가 급증하고 있습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '섬유·의류 수출 트렌드')),

    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'), 'active',
     '베트남 원단 소싱 최신 단가 공유',
     '베트남 호치민·빈증 지역 주요 원단 공장의 2026년 단가를 정리했습니다. TC 원단, CVC 원단, 폴리에스터 원단별 FOB 가격과 MOQ를 비교했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '섬유·의류 수출 트렌드'));

-- 커뮤니티 7: 신재생에너지 무역 포럼
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'moon@test.com'), 'active',
     'EU CBAM 시행에 따른 수출 영향 분석',
     'EU 탄소국경조정메커니즘(CBAM)이 본격 시행되면서 철강, 알루미늄, 시멘트, 비료, 전력 수출에 영향을 미치고 있습니다. 한국 수출기업이 준비해야 할 탄소배출량 보고 체계와 비용 영향을 분석했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '신재생에너지 무역 포럼')),

    ((SELECT id FROM tbl_member WHERE member_email = 'moon@test.com'), 'active',
     '태양광 모듈 수출 동향 (2026년 1분기)',
     '2026년 1분기 태양광 모듈 수출 실적과 시장 동향을 정리했습니다. 미국 IRA법에 따른 보조금 영향, 동남아 우회 수출 규제 강화 등 주요 이슈를 분석합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '신재생에너지 무역 포럼'));

-- 커뮤니티 8: 전자부품 글로벌 소싱
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'jo@test.com'), 'active',
     '삼성·LG 협력사 매칭 성공 사례 공유',
     '유럽 바이어와 삼성·LG 협력사를 ODM 방식으로 매칭한 사례를 공유합니다. 바이어 요구 사항 분석, 공장 선정 기준, 샘플링 프로세스, 그리고 계약 조건 협상 과정을 단계별로 정리했습니다.',
     (SELECT id FROM tbl_community WHERE community_name = '전자부품 글로벌 소싱')),

    ((SELECT id FROM tbl_member WHERE member_email = 'noh@test.com'), 'active',
     '반도체 소싱 시 수출규제 확인 절차',
     '반도체 부품 소싱 시 미국 EAR, 한국 전략물자 수출통제 확인 절차를 정리했습니다. ECCN 분류, 최종 사용자 확인, 수출허가 신청 절차 등 실무에서 반드시 거쳐야 할 단계를 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '전자부품 글로벌 소싱'));

-- 커뮤니티 9: 원산지 관리 실무자 모임
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'song@test.com'), 'active',
     '원산지 사후검증 대응 매뉴얼',
     '관세청의 원산지 사후검증 요청을 받았을 때 대응하는 절차를 정리했습니다. 검증 통보서 수령 후 자료 준비, 소명서 작성 요령, 현장 검증 시 유의사항을 단계별로 안내합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '원산지 관리 실무자 모임')),

    ((SELECT id FROM tbl_member WHERE member_email = 'song@test.com'), 'active',
     '원산지 관리 시스템(FTA-PASS) 활용 팁',
     'FTA-PASS를 활용한 원산지 판정 및 증명서 발급 실무 팁을 공유합니다. 시스템 초기 설정, BOM 등록, 원산지 판정서 자동 생성 기능을 효율적으로 활용하는 방법을 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '원산지 관리 실무자 모임'));

-- 커뮤니티 10: 반도체 수출규제 대응
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'noh@test.com'), 'active',
     '미국 EAR 규정 최신 업데이트 요약',
     '2026년 상반기 미국 수출관리규정(EAR) 주요 변경 사항을 요약했습니다. 반도체 장비 및 AI 칩 관련 규제가 강화되었으며, 대중국 수출통제 엔티티 리스트가 확대되었습니다. 한국 기업이 확인해야 할 핵심 포인트를 정리합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '반도체 수출규제 대응')),

    ((SELECT id FROM tbl_member WHERE member_email = 'noh@test.com'), 'active',
     '전략물자 자가판정 vs 전문기관 판정',
     '전략물자 해당 여부를 자가판정할 때와 전문기관에 의뢰할 때의 장단점을 비교했습니다. 자가판정이 적합한 경우, 전문기관 판정이 필요한 경우를 품목 유형별로 구분하여 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '반도체 수출규제 대응')),

    ((SELECT id FROM tbl_member WHERE member_email = 'jo@test.com'), 'active',
     '일본 반도체 소재 수입 대체 현황',
     '일본 수출규제 이후 한국의 반도체 소재(포토레지스트, 불화수소, EUV 펠리클) 국산화 및 수입 다변화 현황을 정리했습니다. 벨기에, 독일 등 대체 수입국 확보 현황도 함께 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '반도체 수출규제 대응'));

-- 커뮤니티 11: 통관·보세운송 Q&A
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'), 'active',
     '수입 통관 시 자주 발생하는 서류 보완 사유',
     '수입 통관 과정에서 세관이 자주 요청하는 서류 보완 사유를 정리했습니다. 가격 신고 관련, 원산지 증명 관련, 요건 확인 관련 보완 요청이 가장 많으며, 각각의 대응 방법을 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '통관·보세운송 Q&A')),

    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'), 'active',
     '보세구역 반입 및 반출 절차 안내',
     '보세구역(보세창고, 자유무역지역) 반입·반출 절차와 필요한 서류를 정리했습니다. 내국물품 반입, 외국물품 반출, 보세운송 신고 등 실무에서 헷갈리기 쉬운 부분을 중점적으로 설명합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '통관·보세운송 Q&A'));

-- 커뮤니티 12: 원단 소싱 네트워크
INSERT INTO tbl_post (member_id, post_status, title, content, community_id)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'), 'active',
     '인도 면직물 소싱 시 품질 검수 포인트',
     '인도산 면직물 소싱 시 반드시 확인해야 할 품질 검수 포인트를 정리했습니다. 원사 등급, 직조 밀도, 수축률, 색상 견뢰도 등 품질 이슈를 최소화할 수 있는 검수 체크리스트를 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '원단 소싱 네트워크')),

    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'), 'active',
     '방글라데시 원단 공장 직접 방문 후기',
     '다카 인근 원단 공장 3곳을 직접 방문한 후기입니다. 시설 규모, 생산 능력, 납기 신뢰도, 가격 경쟁력을 비교 평가했습니다. 소규모 오더에도 대응 가능한 공장 정보를 함께 공유합니다.',
     (SELECT id FROM tbl_community WHERE community_name = '원단 소싱 네트워크'));
