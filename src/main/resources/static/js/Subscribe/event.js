window.onload = () => {
    // 1. 요소 참조
    const subContent = document.querySelector(".sub-content");
    const toggleTrack = document.querySelector(".sub-toggle__track");
    const toggleOptions = document.querySelectorAll(".sub-toggle__option");
    const plansWrap = document.querySelector(".sub-plans");
    const planButtons = document.querySelectorAll(".sub-plan");
    const compareSections = document.querySelectorAll(".sub-compare");
    const popup = document.getElementById("learnMorePopup");
    const popupClose = document.querySelector(".sub-popup__close");
    const popupBackdrop = document.querySelector(".sub-popup__backdrop");
    const popupTitle = document.querySelector(".sub-popup__title");
    const popupDesc = document.querySelector(".sub-popup__desc");
    const footerPlanName = document.querySelector(".sub-footer__plan-name");
    const footerPrice = document.querySelector(".sub-footer__price");
    const footerPeriod = document.querySelector(".sub-footer__period");
    const footerBilling = document.querySelector(".sub-footer__billing");
    const payBtn = document.querySelector(".sub-footer__pay-btn");
    const cancelBtn = document.querySelector(".sub-footer__cancel-btn");

    const { priceData, learnMoreData, tierMap, planMap, tierRank, parsePrice } = subscribeLayout;

    // 2. 상태
    // 기본적으로 월결제
    let currentPeriod = "monthly";
    // 가장낮은 등급 프로
    let currentPlan = "pro";
    // let mySubscription = null;
    let myPlan = null;

    // 14. 서버에서 mySubscription 받기
    console.log("들어옴1");
    if (mySubscription) {
        console.log("들어옴2");
        myPlan = planMap[mySubscription.tier];
        console.log("들어옴3");
    } else {
        console.log("들어옴7");
    }

    // 3. 플랜 유틸리티
    function isPlanVisible(plan) {
        if (currentPeriod === "expert") return plan === "free" || plan === "expert";
        return plan !== "expert";
    }

    function getDefaultPlan() {
        return currentPeriod === "expert" ? "expert" : "pro";
    }

    function getDisplayPeriod(plan = currentPlan) {
        if (currentPeriod === "annual" && plan !== "expert") return "annual";
        return "monthly";
    }

    function getPaymentPlan() {
        const plan = priceData[currentPlan];
        if (!plan) return null;

        const isAnnual = currentPeriod === "annual" && currentPlan !== "expert";
        const amountText = isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly;

        return {
            ...plan,
            amountText,
            amountValue: parsePrice(amountText),
            orderName: `${plan.displayName} ${isAnnual ? "연간" : "월간"} 구독`,
            orderId: `SUBSCRIBE_${currentPlan.toUpperCase()}_${currentPeriod.toUpperCase()}_${Date.now()}`,
            tier: tierMap[currentPlan],
            billingCycle: isAnnual ? "annual" : "monthly",
        };
    }

    // function calcExpiresAt(billingCycle) {
    //     const now = new Date();
    //     const expiresAt = new Date(now);
    //     if (billingCycle === "annual") {
    //         expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    //     } else {
    //         expiresAt.setMonth(expiresAt.getMonth() + 1);
    //     }
    //     return expiresAt.toISOString().slice(0, 10);
    // }

    function calcExpiresAt(billingCycle) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 1 * 60 * 1000 + 9 * 60 * 60 * 1000); // 1분 뒤
        return expiresAt.toISOString().slice(0, 19).replace("T", " ");
    }

    // 현재 구독중인 플랜 가격
    function getMyPlanPrice() {
        if (!mySubscription) return 0;
        const plan = priceData[myPlan];
        if (!plan) return 0;
        const isAnnual = mySubscription.billingCycle === "annual" && myPlan !== "expert";
        return parsePrice(isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly);
    }

    // 4. 결제 처리
    const onPaymentSuccess = async (plan, bootpayData) => {
        const subscriptionId = await subscribeService.subscribe(plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
        await subscribeService.savePayment(subscriptionId, plan.amountValue, bootpayData);
        alert("구독이 완료되었습니다!");
        location.href = "/main/main";
    };

    const onChangePlanSuccess = async (plan, diffAmount, bootpayData) => {
        await subscribeService.changePlan(mySubscription.id, plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
        await subscribeService.savePayment(mySubscription.id, diffAmount, bootpayData);
        alert("플랜이 변경되었습니다!");
        location.href = "/main/main";
    };

    const pay = async () => {
        // 결제 전 토큰 유효성 확인
        const tokenCheck = await fetch("/api/subscriptions/my");
        if (tokenCheck.status === 401) {
            alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
            location.href = "/member/login";
            return;
        }

        const plan = getPaymentPlan();
        console.log("들어옴11");
        if (!plan || plan.amountValue <= 0) return;

        // 플랜 변경 모드: 차액 계산
        const isChangePlan = !!myPlan;
        const diffAmount = isChangePlan ? plan.amountValue - getMyPlanPrice() : plan.amountValue;
        const payAmount = isChangePlan ? diffAmount : plan.amountValue;
        console.log("들어옴12");
        const payOrderName = isChangePlan
            ? `${priceData[myPlan].displayName} → ${plan.displayName} 플랜 변경`
            : plan.orderName;

        if (payAmount <= 0) return;

        const successHandler = isChangePlan
            ? async (data) => await onChangePlanSuccess(plan, payAmount, data)
            : async (data) => await onPaymentSuccess(plan, data);

        if (typeof Bootpay === "undefined") {
            const demoResult = {
                price: payAmount,
                method: "데모",
                receipt_id: `DEMO_${plan.orderId}`,
                purchased_at: new Date().toISOString(),
            };
            await successHandler(demoResult);
            return;
        }

        try {
            const response = await Bootpay.requestPayment({
                application_id: "69604bf2b6279cebf60ad115",
                price: payAmount,
                order_name: payOrderName,
                order_id: plan.orderId,
                pg: "라이트페이",
                tax_free: 0,
                user: {
                    id: String(memberId),
                    username: "회원",
                    phone: "01000000000",
                    email: "user@globalgates.com",
                },
                items: [
                    {
                        id: currentPlan,
                        name: payOrderName,
                        qty: 1,
                        price: payAmount,
                    },
                ],
                extra: {
                    open_type: "iframe",
                    card_quota: "0,2,3",
                    escrow: false,
                },
            });

            switch (response.event) {
                case "issued": {
                    if (isChangePlan) {
                        await subscribeService.changePlan(mySubscription.id, plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
                        await subscribeService.savePayment(mySubscription.id, payAmount, response.data);
                    } else {
                        const issuedSubId = await subscribeService.subscribe(plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
                        await subscribeService.savePayment(issuedSubId, payAmount, response.data);
                    }
                    alert("가상계좌가 발급되었습니다. 입금 완료 시 구독이 활성화됩니다.");
                    break;
                }
                case "done":
                    await successHandler(response.data);
                    break;
                case "confirm": {
                    const confirmedData = await Bootpay.confirm();
                    if (confirmedData.event === "done") {
                        await successHandler(confirmedData.data);
                    }
                    break;
                }
            }
        } catch (e) {
            console.log(e.message);
            switch (e.event) {
                case "cancel":
                    console.log(e.message);
                    break;
                case "error":
                    console.log(e.error_code);
                    break;
            }
        }
    };

    // 5. 토글 상태 반영
    function syncToggleState() {
        toggleOptions.forEach((opt) => {
            const isActive = opt.dataset.period === currentPeriod;
            opt.setAttribute("aria-checked", String(isActive));
            opt.classList.toggle("sub-toggle__option--active", isActive);
        });
        toggleTrack.dataset.period = currentPeriod;
    }

    // 6. 플랜 선택 상태 반영
    function renderPlanSelection() {
        planButtons.forEach((btn) => {
            const plan = btn.dataset.plan;
            const isSelected = plan === currentPlan;
            const isMyCurrent = myPlan && plan === myPlan;
            const isLowerThanMy = myPlan && tierRank[plan] < tierRank[myPlan];
            const card = btn.querySelector(".sub-plan__card");
            const radio = btn.querySelector(".sub-plan__radio");
            const circle = radio.querySelector(".sub-plan__radio-circle");

            btn.classList.toggle("sub-plan--selected", isSelected);
            btn.classList.toggle("sub-plan--current", isMyCurrent);
            btn.classList.toggle("sub-plan--disabled", isLowerThanMy);
            btn.setAttribute("aria-checked", String(isSelected));
            card.classList.toggle("sub-plan__card--active", isSelected);
            radio.classList.toggle("sub-plan__radio--checked", isSelected);
            circle.innerHTML = isSelected
                ? `<svg viewBox="0 0 24 24" aria-hidden="true" class="sub-plan__check-icon"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`
                : "";

            // "현재 플랜" 라벨
            let currentLabel = btn.querySelector(".sub-plan__current-label");
            if (isMyCurrent) {
                if (!currentLabel) {
                    currentLabel = document.createElement("span");
                    currentLabel.className = "sub-plan__current-label";
                    currentLabel.textContent = "현재 플랜";
                    card.querySelector(".sub-plan__body").prepend(currentLabel);
                }
            } else if (currentLabel) {
                currentLabel.remove();
            }
        });
    }

    function activatePlan(btn) {
        const plan = btn.dataset.plan;
        console.log("들어옴8");
        if (!isPlanVisible(plan) || plan === currentPlan) return;
        console.log("들어옴10");
        currentPlan = plan;
        renderPlanSelection();
        updateFooter();
    }

    function syncVisiblePlans() {
        if (subContent) subContent.dataset.mode = currentPeriod === "expert" ? "expert" : "standard";
        if (plansWrap) plansWrap.dataset.mode = currentPeriod === "expert" ? "expert" : "standard";

        compareSections.forEach((section) => {
            const compareMode = section.dataset.compareMode;
            section.hidden = compareMode === "expert"
                ? currentPeriod !== "expert"
                : currentPeriod === "expert";
        });

        planButtons.forEach((btn) => {
            const visible = isPlanVisible(btn.dataset.plan);
            btn.hidden = !visible;
            btn.tabIndex = visible ? 0 : -1;
        });

        if (!isPlanVisible(currentPlan)) currentPlan = getDefaultPlan();
        renderPlanSelection();
    }

    // 7. 가격 표시 업데이트
    function updatePrices() {
        document.querySelectorAll(".sub-plan__price[data-monthly]").forEach((el) => {
            const plan = el.closest(".sub-plan")?.dataset.plan;
            el.textContent = el.dataset[getDisplayPeriod(plan)];
        });
        document.querySelectorAll(".sub-plan__billing-text[data-monthly]").forEach((el) => {
            const plan = el.closest(".sub-plan")?.dataset.plan;
            el.textContent = el.dataset[getDisplayPeriod(plan)];
        });
    }

    // 8. 결제하단바 업데이트
    function updateFooter() {
        const plan = priceData[currentPlan];
        if (!plan) return;
        const isFree = currentPlan === "free";
        const isAnnual = currentPeriod === "annual" && currentPlan !== "expert";
        const btnLabel = payBtn.querySelector("span");

        footerPlanName.textContent = plan.displayName;

        if (myPlan) {
            // 해지 예약된 사용자 (월간 + quartz=false)
            const isCancelReserved = mySubscription.billingCycle === "monthly" && !mySubscription.quartz;
            if (isCancelReserved) {
                footerPrice.textContent = "해지 예약됨";
                footerPeriod.textContent = "";
                footerBilling.textContent = "만료일까지 이용 가능합니다";
                btnLabel.textContent = "플랜 변경";
                payBtn.disabled = true;
            } else {

            // 구독 변경 모드
            const newPrice = parsePrice(isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly);
            const currentPrice = getMyPlanPrice();
            const diff = newPrice - currentPrice;

            const isSameTier = currentPlan === myPlan;
            const isHigherTier = tierRank[currentPlan] > tierRank[myPlan];
            const isLowerTier = tierRank[currentPlan] < tierRank[myPlan];
            const myBillingCycle = mySubscription.billingCycle;
            const isSameExact = isSameTier && currentPeriod === myBillingCycle;
            // 같은 tier 월간→연간
            const isSameTierUpgrade = isSameTier && myBillingCycle === "monthly" && currentPeriod === "annual";

            // 연간→월간 변경 불가
            const isAnnualToMonthly = myBillingCycle === "annual" && currentPeriod !== "annual";
            // 허용: 연간→월간이 아니고 (상위 tier이거나, 같은 tier 월간→연간)
            const canChange = !isAnnualToMonthly && (isHigherTier || isSameTierUpgrade);

            if (isSameExact) {
                footerPrice.textContent = "현재 플랜";
                footerPeriod.textContent = "";
                footerBilling.textContent = "";
            } else if (!canChange) {
                footerPrice.textContent = "변경 불가";
                footerPeriod.textContent = "";
                footerBilling.textContent = isLowerTier ? "하위 플랜으로 변경할 수 없습니다" : "동일 플랜 연간→월간 변경 불가";
            } else {
                footerPrice.textContent = `₩${diff.toLocaleString()}`;
                footerPeriod.textContent = "(차액)";
                footerBilling.textContent = `${priceData[myPlan].displayName} → ${plan.displayName}`;
            }
            btnLabel.textContent = "플랜 변경";
            payBtn.disabled = isSameExact || !canChange;
            }
        } else {
            // 신규 구독 모드
            footerPrice.textContent = isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly;
            footerPeriod.textContent = isFree ? "" : isAnnual ? "/ 연" : "/ 월";
            footerBilling.textContent = isAnnual ? plan.billingAnnual : plan.billingMonthly;
            btnLabel.textContent = "구독 및 결제";
            payBtn.disabled = isFree;
        }
        if (cancelBtn) {
            if (mySubscription && mySubscription.billingCycle === "monthly") {
                cancelBtn.disabled = false;
            } else {
                cancelBtn.disabled = true;
            }
        }
    }

    // 9. 토글 이벤트
    toggleOptions.forEach((option) => {
        option.addEventListener("click", (e) => {
            const period = option.dataset.period;
            if (period === currentPeriod) return;
            currentPeriod = period;
            toggleTrack.dataset.period = period;
            syncToggleState();
            syncVisiblePlans();
            updatePrices();
            updateFooter();
        });
    });

    // 10. 카드 이벤트
    planButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (e.target.closest(".sub-feature__info")) return;
            activatePlan(btn);
        });
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activatePlan(btn);
            }
        });
    });

    // 11. 팝업 이벤트
    document.querySelectorAll(".sub-feature__info").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const data = learnMoreData[btn.dataset.info];
            if (!data) return;
            popupTitle.textContent = data.title;
            popupDesc.textContent = data.desc;
            popup.style.display = "";
        });
    });

    function closePopup() { popup.style.display = "none"; }
    if (popupClose) popupClose.addEventListener("click", closePopup);
    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);

    // 12. ESC 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.style.display !== "none") closePopup();
    });

    // 13. 결제 버튼
    if (payBtn) {
        payBtn.addEventListener("click", async (e) => {
            if (confirm("결제를 진행합니다.")) {
                if (payBtn.disabled) return;
                await pay();
            } else { return; }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", async (e) => {
            if (cancelBtn.disabled) return;
            if (confirm("구독을 해지하시겠습니까? 만료일까지 이용 가능합니다.")) {
                await subscribeService.cancel(mySubscription.id);
                alert("구독 해지가 완료되었습니다. 만료일까지 이용 가능합니다.");
                location.reload();
            }
        });
    }



    syncToggleState();
    syncVisiblePlans();
    updatePrices();
    updateFooter();
};
