window.addEventListener("load", async () => {
    const q = (selector, scope = document) => scope.querySelector(selector);
    const qAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const tabButtons = qAll("[data-inquiry-tab]");
    const panels = qAll("[data-inquiry-panel]");
    const filterTrigger = q("[data-activity-filter-trigger]");
    const filterMenu = q("[data-activity-filter-menu]");
    const filterLabel = q("[data-activity-filter-label]");
    const filterItems = qAll("[data-activity-filter-item]");
    const periodChips = qAll("[data-period-chip]");
    const startInput = q("[data-activity-date-start]");
    const endInput = q("[data-activity-date-end]");
    const detailModal = q("[data-estimation-detail-modal]");
    const detailBody = q(".estimation-detail-modal__body");
    const detailCloseButtons = qAll("[data-estimation-detail-close]");
    const confirmModal = q("[data-estimation-confirm-modal]");
    const confirmCloseButtons = qAll("[data-estimation-confirm-close]");
    const confirmSubmitButton = q("[data-estimation-confirm-submit]");
    const confirmTitle = q("[data-estimation-confirm-title]");
    const listRoot = q("[data-estimation-list]");

    const PREVIEW_DURATION_MS = 280;
    const PERIOD_DAYS = { "7D": 7, "2W": 14, "4W": 28, "3M": 90 };

    let activeDetailTrigger = null;
    let pendingDecision = null;
    let activeFilterState = "all";
    let estimationStore = [];

    const escapeHtml = (value = "") =>
        String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const formatTags = (tags = []) => {
        if (!tags.length) {
            return '<span class="Category-Tag">#태그없음</span>';
        }

        return tags
            .map((tag, index) => `<span class="Category-Tag" data-cate-id="cate${index + 1}">#${escapeHtml(tag.tagName)}</span>`)
            .join("");
    };

    const formatLocation = (location) => {
        const text = String(location ?? "").trim();
        return text ? escapeHtml(text) : "위치 미등록";
    };

    const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase();

    const toFilterState = (status) => {
        const normalized = normalizeStatus(status);
        if (normalized === "approve" || normalized === "reject") {
            return normalized;
        }
        return "requesting";
    };

    const formatStatusLabel = (status) => {
        switch (normalizeStatus(status)) {
            case "approve":
                return "승인됨";
            case "reject":
                return "거절됨";
            default:
                return "요청중";
        }
    };

    const normalizeDate = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "";

        const matched = text.match(/^(\d{4}-\d{2}-\d{2})/);
        if (matched) {
            return matched[1];
        }

        const parsed = new Date(text);
        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return formatDate(parsed);
    };

    const renderCard = (estimation) => `
        <div class="postCard estimation-preview-card"
             data-estimation-card
             data-filter-state="${escapeHtml(toFilterState(estimation.status))}"
             data-created-date="${escapeHtml(normalizeDate(estimation.createdDateTime))}"
             data-estimation-detail-target="detail-${estimation.id}">
            <div class="postAvatar postAvatar--image">
                <img src="/images/main/ad.png" alt="" class="postAvatarImage"/>
            </div>
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        <strong class="postName">${escapeHtml(estimation.receiverEmail || "전문가")}</strong>
                        <span class="postHandle">견적 요청</span>
                        <span class="postTime">${escapeHtml(estimation.createdDateTime || "")}</span>
                    </div>
                    <div class="estimation-preview-card__status-wrap">
                        <span class="estimation-preview-card__status">${escapeHtml(formatStatusLabel(estimation.status))}</span>
                    </div>
                    <div class="estimation-more">
                        <button type="button" class="tweet-more-btn" data-estimation-more-trigger aria-expanded="false" aria-label="더보기">
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-more-icon">
                                <g>
                                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                                </g>
                            </svg>
                        </button>
                        <div class="dropdown-menu estimation-dropdown-menu" role="menu">
                            <button type="button" class="menu-item estimation-delete-action" data-estimation-delete="detail-${estimation.id}">
                                견적 요청 삭제하기
                            </button>
                        </div>
                    </div>
                </header>
                <div class="estimation-preview-card__link">
                    <div class="estimation-preview-card__person">
                        <img src="/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                        <span class="estimation-preview-card__email">${escapeHtml(estimation.requesterEmail || "-")}</span>
                    </div>
                    <span class="estimation-preview-card__icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"></path>
                            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"></path>
                        </svg>
                    </span>
                    <div class="estimation-preview-card__person">
                        <img src="/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
                        <span class="estimation-preview-card__email">${escapeHtml(estimation.receiverEmail || "공개 견적")}</span>
                    </div>
                </div>
                <button type="button"
                        class="estimation-preview-card__body"
                        data-estimation-detail-target="detail-${estimation.id}"
                        aria-label="${escapeHtml(estimation.title || "견적 요청")} 상세 보기">
                    <div class="Detail-Category-Tags">${formatTags(estimation.tags)}</div>
                    <strong class="estimation-preview-card__title">${escapeHtml(estimation.title || "")}</strong>
                    <p class="postText">${escapeHtml(estimation.content || "")}</p>
                    <div class="estimation-preview-card__location">
                        <span class="estimation-preview-card__location-label">위치</span>
                        <span class="estimation-preview-card__location-text">${formatLocation(estimation.location)}</span>
                    </div>
                </button>
            </div>
        </div>
    `;

    const renderDetailPanel = (estimation) => `
        <div class="estimation-detail-panel" data-estimation-detail-panel="detail-${estimation.id}" hidden>
            <div class="estimation-detail-panel__hero">
                <h3 class="estimation-detail-panel__title">${escapeHtml(estimation.title || "")}</h3>
                <p class="estimation-detail-panel__description">${escapeHtml(estimation.content || "")}</p>
            </div>
            <div class="estimation-detail-panel__link">
                <div class="estimation-preview-card__person">
                    <img src="/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                    <span class="estimation-preview-card__email">${escapeHtml(estimation.requesterEmail || "-")}</span>
                </div>
                <span class="estimation-preview-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"></path>
                        <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"></path>
                    </svg>
                </span>
                <div class="estimation-preview-card__person">
                    <img src="/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
                    <span class="estimation-preview-card__email">${escapeHtml(estimation.receiverEmail || "공개 견적")}</span>
                </div>
            </div>
            <section class="estimation-detail-panel__section">
                <h4 class="estimation-detail-panel__section-title">태그</h4>
                <div class="Detail-Category-Tags">${formatTags(estimation.tags)}</div>
            </section>
            <section class="estimation-detail-panel__section">
                <h4 class="estimation-detail-panel__section-title">상태</h4>
                <p class="estimation-detail-panel__list" data-estimation-status-text="detail-${estimation.id}">${escapeHtml(formatStatusLabel(estimation.status))}</p>
            </section>
            <section class="estimation-detail-panel__section">
                <h4 class="estimation-detail-panel__section-title">위치</h4>
                <p class="estimation-detail-panel__list">${formatLocation(estimation.location)}</p>
            </section>
            <div class="estimation-action-slot estimation-action-slot--modal">
                <div class="estimation-action-group estimation-action-group--modal" data-estimation-decision-group="detail-${estimation.id}" ${normalizeStatus(estimation.status) === "approve" || normalizeStatus(estimation.status) === "reject" ? "hidden" : ""}>
                    <button type="button"
                            class="estimation-action-btn estimation-action-btn--approve"
                            data-estimation-decision-id="detail-${estimation.id}"
                            data-estimation-decision="approve"
                            aria-pressed="false">승인</button>
                    <button type="button"
                            class="estimation-action-btn estimation-action-btn--reject"
                            data-estimation-decision-id="detail-${estimation.id}"
                            data-estimation-decision="reject"
                            aria-pressed="false">거절</button>
                </div>
                <div class="estimation-approved-state" data-estimation-approved-state="detail-${estimation.id}" ${normalizeStatus(estimation.status) === "approve" ? "" : "hidden"}>승인됨</div>
                <div class="estimation-rejected-state" data-estimation-rejected-state="detail-${estimation.id}" ${normalizeStatus(estimation.status) === "reject" ? "" : "hidden"}>거절됨</div>
            </div>
        </div>
    `;

    const setActiveTab = (name) => {
        tabButtons.forEach((tab) => {
            const isActive = tab.dataset.inquiryTab === name;
            tab.classList.toggle("inquiry-tab--active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
            panel.hidden = panel.dataset.inquiryPanel !== name;
        });
    };

    const previewTab = (tab) => {
        tab.classList.remove("inquiry-tab--preview");
        void tab.offsetWidth;
        tab.classList.add("inquiry-tab--preview");
        window.setTimeout(() => tab.classList.remove("inquiry-tab--preview"), PREVIEW_DURATION_MS);
    };

    const closeFilterMenu = () => {
        if (!filterTrigger || !filterMenu) return;
        filterMenu.hidden = true;
        filterTrigger.setAttribute("aria-expanded", "false");
    };

    const closeMoreMenus = () => {
        qAll("[data-estimation-more-trigger]").forEach((button) => {
            const wrapper = button.closest(".estimation-more");
            button.setAttribute("aria-expanded", "false");
            wrapper?.classList.remove("is-open");
        });
    };

    const isWithinDateRange = (cardDateText) => {
        const cardDate = normalizeDate(cardDateText);
        if (!cardDate) return true;

        const startDate = normalizeDate(startInput?.value);
        const endDate = normalizeDate(endInput?.value);

        if (!startDate && !endDate) return true;
        if (startDate && cardDate < startDate) return false;
        if (endDate && cardDate > endDate) return false;
        return true;
    };

    const applyFilters = () => {
        qAll("[data-estimation-card]").forEach((card) => {
            const statusMatched =
                activeFilterState === "all" || card.dataset.filterState === activeFilterState;
            const dateMatched = isWithinDateRange(card.dataset.createdDate);
            card.hidden = !(statusMatched && dateMatched);
        });
    };

    const setFilter = (item) => {
        const value = item.dataset.activityFilterItem;
        const label = item.querySelector(".activity-filter-menu__label");

        filterItems.forEach((button) => {
            const isSelected = button === item;
            button.classList.toggle("activity-filter-menu__item--selected", isSelected);
            button.setAttribute("aria-checked", String(isSelected));
        });

        if (filterLabel && label) {
            filterLabel.textContent = label.textContent.trim();
        }

        activeFilterState = value;
        applyFilters();
        closeFilterMenu();
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const syncPeriod = (chip) => {
        const days = PERIOD_DAYS[chip.dataset.periodChip];
        if (!days || !startInput || !endInput) return;

        const today = new Date();
        const end = endInput.value ? new Date(endInput.value) : today;
        if (Number.isNaN(end.getTime())) {
            end.setTime(today.getTime());
        }
        const start = new Date(end);
        start.setDate(end.getDate() - (days - 1));
        startInput.value = formatDate(start);
        endInput.value = formatDate(end);
        applyFilters();
    };

    const initializeDateRange = () => {
        if (!startInput || !endInput) return;

        const activeChip =
            periodChips.find((button) => button.classList.contains("period-chip--active")) || periodChips[0];

        if (activeChip) {
            endInput.value = formatDate(new Date());
            syncPeriod(activeChip);
            return;
        }

        const today = new Date();
        endInput.value = formatDate(today);
        startInput.value = formatDate(today);
        applyFilters();
    };

    const hideDetailPanels = () => {
        qAll("[data-estimation-detail-panel]").forEach((panel) => {
            panel.hidden = true;
        });
    };

    const closeDetailModal = () => {
        if (!detailModal) return;
        detailModal.hidden = true;
        document.body.classList.remove("modal-open");
        hideDetailPanels();
        activeDetailTrigger?.focus();
        activeDetailTrigger = null;
    };

    const closeConfirmModal = () => {
        if (!confirmModal) return;
        confirmModal.hidden = true;
        pendingDecision = null;
    };

    const openConfirmModal = (slot, type) => {
        if (!confirmModal || !(slot instanceof HTMLElement) || !type) return;
        pendingDecision = { slot, type };
        if (confirmTitle) {
            confirmTitle.textContent = type === "approve" ? "정말 승인하시겠습니까?" : "거절하시겠습니까?";
        }
        confirmSubmitButton?.classList.toggle("is-reject", type === "reject");
        confirmModal.hidden = false;
    };

    const applyDecisionState = (slot, type) => {
        q("[data-estimation-decision-group]", slot)?.setAttribute("hidden", "");
        q("[data-estimation-approved-state]", slot)?.setAttribute("hidden", "");
        q("[data-estimation-rejected-state]", slot)?.setAttribute("hidden", "");

        if (type === "approve") {
            q("[data-estimation-approved-state]", slot)?.removeAttribute("hidden");
            return;
        }

        q("[data-estimation-rejected-state]", slot)?.removeAttribute("hidden");
    };

    const updateCardStatus = (estimationId, type) => {
        const card = q(`[data-estimation-card][data-estimation-detail-target="detail-${estimationId}"]`);
        if (!card) return;

        card.dataset.filterState = type;
        const statusText = card.querySelector(".estimation-preview-card__status");
        if (statusText) {
            statusText.textContent = formatStatusLabel(type);
        }
    };

    const updateDetailStatus = (estimationId, type) => {
        const panel = q(`[data-estimation-detail-panel="detail-${estimationId}"]`);
        if (!panel) return;

        const statusText = q(`[data-estimation-status-text="detail-${estimationId}"]`, panel);
        if (statusText) {
            statusText.textContent = formatStatusLabel(type);
        }
    };

    const persistDecision = async (estimationId, type) => {
        const response = await fetch(`/api/estimations/${estimationId}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ status: type }),
        });

        if (!response.ok) {
            throw new Error(`견적 요청 상태 변경 실패 (${response.status})`);
        }

        const result = await response.json();
        if (!result) {
            throw new Error("견적 요청 상태 변경이 반영되지 않았습니다.");
        }
    };

    const syncDecisionButtons = (decisionId, selectedDecision) => {
        qAll("[data-estimation-decision]")
            .filter((button) => button.dataset.estimationDecisionId === decisionId)
            .forEach((button) => {
                const isActive = button.dataset.estimationDecision === selectedDecision;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });
    };

    const openDetailModal = (target, trigger) => {
        if (!target || !detailModal) return;

        hideDetailPanels();
        const panel = q(`[data-estimation-detail-panel="${target}"]`);
        if (!panel) return;

        activeDetailTrigger = trigger;
        panel.hidden = false;
        detailModal.hidden = false;
        document.body.classList.add("modal-open");
    };

    const handleDetailTrigger = (button) => {
        const target =
            button.dataset.estimationDetailTarget ||
            button.closest("[data-estimation-card]")?.dataset.estimationDetailTarget;
        openDetailModal(target, button);
    };

    const bindDynamicEvents = () => {
        qAll(".estimation-preview-card__body[data-estimation-detail-target]").forEach((button) => {
            button.addEventListener("click", () => handleDetailTrigger(button));
        });

        qAll("[data-estimation-more-trigger]").forEach((button) => {
            const wrapper = button.closest(".estimation-more");
            const menu = button.nextElementSibling;

            if (!(wrapper instanceof HTMLElement) || !(menu instanceof HTMLElement)) return;

            menu.addEventListener("click", (event) => event.stopPropagation());
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const isExpanded = wrapper.classList.contains("is-open");
                closeMoreMenus();
                if (!isExpanded) {
                    wrapper.classList.add("is-open");
                    button.setAttribute("aria-expanded", "true");
                }
            });
        });

        qAll("[data-estimation-decision]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                syncDecisionButtons(button.dataset.estimationDecisionId, button.dataset.estimationDecision);
                openConfirmModal(button.closest(".estimation-action-slot"), button.dataset.estimationDecision);
            });
        });
    };

    const renderEstimations = (estimations) => {
        if (!listRoot || !detailBody) return;
        estimationStore = estimations;

        if (!estimations.length) {
            listRoot.innerHTML = '<p class="estimation-empty">등록된 견적요청이 없습니다.</p>';
            detailBody.innerHTML = "";
            return;
        }

        listRoot.innerHTML = estimations.map(renderCard).join("");
        detailBody.innerHTML = estimations.map(renderDetailPanel).join("");
        bindDynamicEvents();
        activeFilterState = "all";
        applyFilters();
    };

    const loadEstimations = async () => {
        try {
            const response = await fetch("/api/estimations/list/1", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (!response.ok) {
                throw new Error(`견적 목록 조회 실패 (${response.status})`);
            }

            const data = await response.json();
            renderEstimations(data.estimations || []);
        } catch (error) {
            console.error(error);
            if (listRoot) {
                listRoot.innerHTML = '<p class="estimation-empty">견적 목록을 불러오지 못했습니다.</p>';
            }
        }
    };

    tabButtons.forEach((tab) => {
        tab.addEventListener("click", () => {
            previewTab(tab);
            setActiveTab(tab.dataset.inquiryTab || "quotes");
        });
    });

    filterTrigger?.addEventListener("click", () => {
        const isExpanded = filterTrigger.getAttribute("aria-expanded") === "true";
        filterTrigger.setAttribute("aria-expanded", String(!isExpanded));
        if (filterMenu) {
            filterMenu.hidden = isExpanded;
        }
    });

    filterItems.forEach((item) => item.addEventListener("click", () => setFilter(item)));
    periodChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            periodChips.forEach((button) => {
                button.classList.toggle("period-chip--active", button === chip);
            });
            syncPeriod(chip);
        });
    });

    startInput?.addEventListener("change", () => {
        applyFilters();
    });

    endInput?.addEventListener("change", () => {
        applyFilters();
    });

    detailCloseButtons.forEach((button) => button.addEventListener("click", closeDetailModal));
    confirmCloseButtons.forEach((button) => button.addEventListener("click", closeConfirmModal));
    confirmSubmitButton?.addEventListener("click", async () => {
        if (!pendingDecision) return;

        const slot = pendingDecision.slot;
        const type = pendingDecision.type;
        const panel = slot?.closest("[data-estimation-detail-panel]");
        const detailId = panel?.dataset.estimationDetailPanel || "";
        const estimationId = Number(detailId.replace("detail-", ""));

        try {
            confirmSubmitButton.disabled = true;
            await persistDecision(estimationId, type);
            applyDecisionState(slot, type);
            updateCardStatus(estimationId, type);
            updateDetailStatus(estimationId, type);
            const target = estimationStore.find((estimation) => estimation.id === estimationId);
            if (target) {
                target.status = type;
            }
            applyFilters();
            closeConfirmModal();
        } catch (error) {
            console.error(error);
            window.alert("견적 요청 상태 반영 중 오류가 발생했습니다.");
        } finally {
            confirmSubmitButton.disabled = false;
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (filterMenu && !filterMenu.hidden && !target.closest("[data-activity-filter-menu]") && !target.closest("[data-activity-filter-trigger]")) {
            closeFilterMenu();
        }

        if (!target.closest(".estimation-more")) {
            closeMoreMenus();
        }
    });

    setActiveTab("quotes");
    initializeDateRange();
    await loadEstimations();
});
