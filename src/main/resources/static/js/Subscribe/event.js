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

    const { priceData, learnMoreData, tierMap, parsePrice } = subscribeLayout;

    // 2. 상태
    let currentPeriod = "monthly";
    let currentPlan = "pro";

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

    function calcExpiresAt(billingCycle) {
        const now = new Date();
        const expiresAt = new Date(now);
        if (billingCycle === "annual") {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        return expiresAt.toISOString().slice(0, 19).replace("T", " ");
    }

    // 4. 결제 처리
    const onPaymentSuccess = async (plan, bootpayData) => {
        const subscriptionId = await subscribeService.subscribe(plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
        await subscribeService.savePayment(subscriptionId, plan.amountValue, bootpayData);
        alert("구독이 완료되었습니다!");
        location.href = "/main/main";
    };

    const pay = async () => {
        const plan = getPaymentPlan();
        if (!plan || plan.amountValue <= 0) return;

        if (typeof Bootpay === "undefined") {
            const demoResult = {
                price: plan.amountValue,
                method: "데모",
                receipt_id: `DEMO_${plan.orderId}`,
                purchased_at: new Date().toISOString(),
            };
            await onPaymentSuccess(plan, demoResult);
            return;
        }

        try {
            const response = await Bootpay.requestPayment({
                application_id: "69604bf2b6279cebf60ad115",
                price: plan.amountValue,
                order_name: plan.orderName,
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
                        name: plan.orderName,
                        qty: 1,
                        price: plan.amountValue,
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
                    const issuedSubId = await subscribeService.subscribe(plan.tier, plan.billingCycle, calcExpiresAt(plan.billingCycle));
                    await subscribeService.savePayment(issuedSubId, plan.amountValue, response.data);
                    alert("가상계좌가 발급되었습니다. 입금 완료 시 구독이 활성화됩니다.");
                    break;
                }
                case "done":
                    await onPaymentSuccess(plan, response.data);
                    break;
                case "confirm": {
                    const confirmedData = await Bootpay.confirm();
                    if (confirmedData.event === "done") {
                        await onPaymentSuccess(plan, confirmedData.data);
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
            const isSelected = btn.dataset.plan === currentPlan;
            const card = btn.querySelector(".sub-plan__card");
            const radio = btn.querySelector(".sub-plan__radio");
            const circle = radio.querySelector(".sub-plan__radio-circle");

            btn.classList.toggle("sub-plan--selected", isSelected);
            btn.setAttribute("aria-checked", String(isSelected));
            card.classList.toggle("sub-plan__card--active", isSelected);
            radio.classList.toggle("sub-plan__radio--checked", isSelected);
            circle.innerHTML = isSelected
                ? `<svg viewBox="0 0 24 24" aria-hidden="true" class="sub-plan__check-icon"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`
                : "";
        });
    }

    function activatePlan(btn) {
        const plan = btn.dataset.plan;
        if (!isPlanVisible(plan) || plan === currentPlan) return;
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

    // 8. footer 업데이트
    function updateFooter() {
        const plan = priceData[currentPlan];
        if (!plan) return;
        const isFree = currentPlan === "free";
        const isAnnual = currentPeriod === "annual" && currentPlan !== "expert";
        footerPlanName.textContent = plan.displayName;
        footerPrice.textContent = isAnnual ? (plan.annualTotal ?? plan.annual) : plan.monthly;
        footerPeriod.textContent = isFree ? "" : isAnnual ? "/ 연" : "/ 월";
        footerBilling.textContent = isAnnual ? plan.billingAnnual : plan.billingMonthly;
        payBtn.disabled = isFree;
    }

    // 9. 토글 이벤트
    toggleOptions.forEach((option) => {
        option.addEventListener("click", () => {
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
        payBtn.addEventListener("click", async () => {
            if (payBtn.disabled) return;
            await pay();
        });
    }

    // 14. 초기화
    syncToggleState();
    syncVisiblePlans();
    updatePrices();
    updateFooter();
};
