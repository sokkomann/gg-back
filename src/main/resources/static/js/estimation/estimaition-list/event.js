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
            .map(
                (tag, index) =>
                    `<span class="Category-Tag" data-cate-id="cate${index + 1}">#${escapeHtml(tag.tagName)}</span>`,
            )
            .join("");
    };

    const toFilterState = (status) => {
        switch (status) {
            case "approve":
                return "closed";
            case "reject":
                return "review";
            default:
                return "open";
        }
    };

    const renderCard = (estimation) => `
        <div class="postCard estimation-preview-card"
             data-estimation-card
             data-filter-state="${escapeHtml(toFilterState(estimation.status))}"
             data-estimation-detail-target="detail-${estimation.id}">
            <header class="estimation-preview-card__header">
                <div class="estimation-preview-card__meta">
                    <span class="estimation-preview-card__status">${escapeHtml(estimation.status || "requesting")}</span>
                    <span class="estimation-preview-card__date">${escapeHtml(estimation.createdDateTime || "")}</span>
                </div>
                <div class="estimation-more">
                    <button type="button" class="estimation-more__trigger" data-estimation-more-trigger aria-expanded="false">
                        <span>더보기</span>
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
                    <img src="../../static/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                    <span class="estimation-preview-card__email">${escapeHtml(estimation.requesterEmail || "-")}</span>
                </div>
                <span class="estimation-preview-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"/>
                        <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                    </svg>
                </span>
                <div class="estimation-preview-card__person">
                    <img src="../../static/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
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
            </button>
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
                    <img src="../../static/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                    <span class="estimation-preview-card__email">${escapeHtml(estimation.requesterEmail || "-")}</span>
                </div>
                <span class="estimation-preview-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"/>
                        <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                    </svg>
                </span>
                <div class="estimation-preview-card__person">
                    <img src="../../static/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
                    <span class="estimation-preview-card__email">${escapeHtml(estimation.receiverEmail || "공개 견적")}</span>
                </div>
            </div>
            <section class="estimation-detail-panel__section">
                <h4 class="estimation-detail-panel__section-title">태그</h4>
                <div class="Detail-Category-Tags">${formatTags(estimation.tags)}</div>
            </section>
            <section class="estimation-detail-panel__section">
                <h4 class="estimation-detail-panel__section-title">상태</h4>
                <p class="estimation-detail-panel__list">${escapeHtml(estimation.status || "requesting")}</p>
            </section>
            <div class="estimation-action-slot estimation-action-slot--modal">
                <div class="estimation-action-group estimation-action-group--modal" data-estimation-decision-group="detail-${estimation.id}">
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
                <div class="estimation-approved-state" data-estimation-approved-state="detail-${estimation.id}" hidden>승인됨</div>
                <div class="estimation-rejected-state" data-estimation-rejected-state="detail-${estimation.id}" hidden>거절됨</div>
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

    const getMoreMenu = (button) => {
        const menu = button.nextElementSibling;
        return menu instanceof HTMLElement ? menu : null;
    };

    const closeMoreMenus = () => {
        qAll("[data-estimation-more-trigger]").forEach((button) => {
            const wrapper = button.closest(".estimation-more");
            button.setAttribute("aria-expanded", "false");
            wrapper?.classList.remove("is-open");
        });
    };

    const applyFilter = (value) => {
        qAll("[data-estimation-card]").forEach((card) => {
            card.hidden = value !== "all" && card.dataset.filterState !== value;
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

        applyFilter(value);
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

        const end = new Date(endInput.value || new Date());
        const start = new Date(end);
        start.setDate(end.getDate() - (days - 1));
        startInput.value = formatDate(start);
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
            const menu = getMoreMenu(button);

            if (!(wrapper instanceof HTMLElement) || !menu) return;

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
                syncDecisionButtons(
                    button.dataset.estimationDecisionId,
                    button.dataset.estimationDecision,
                );
                openConfirmModal(
                    button.closest(".estimation-action-slot"),
                    button.dataset.estimationDecision,
                );
            });
        });
    };

    const renderEstimations = (estimations) => {
        if (!listRoot || !detailBody) return;

        if (!estimations.length) {
            listRoot.innerHTML = '<p class="estimation-empty">등록된 견적 요청이 없습니다.</p>';
            detailBody.innerHTML = "";
            return;
        }

        listRoot.innerHTML = estimations.map(renderCard).join("");
        detailBody.innerHTML = estimations.map(renderDetailPanel).join("");
        bindDynamicEvents();
        applyFilter("all");
    };

    const loadEstimations = async () => {
        try {
            const response = await fetch("/api/estimations/list/1");
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

    detailCloseButtons.forEach((button) => button.addEventListener("click", closeDetailModal));
    confirmCloseButtons.forEach((button) => button.addEventListener("click", closeConfirmModal));
    confirmSubmitButton?.addEventListener("click", () => {
        if (!pendingDecision) return;
        applyDecisionState(pendingDecision.slot, pendingDecision.type);
        closeConfirmModal();
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (
            filterMenu &&
            !filterMenu.hidden &&
            !target.closest("[data-activity-filter-menu]") &&
            !target.closest("[data-activity-filter-trigger]")
        ) {
            closeFilterMenu();
        }

        if (
            !target.closest("[data-estimation-more-trigger]") &&
            !target.closest(".estimation-dropdown-menu")
        ) {
            closeMoreMenus();
        }

        const deleteAction = target.closest("[data-estimation-delete]");
        if (deleteAction instanceof HTMLElement) {
            const targetId = deleteAction.dataset.estimationDelete || "";
            q(`[data-estimation-card][data-estimation-detail-target="${targetId}"]`)?.remove();
            q(`[data-estimation-detail-panel="${targetId}"]`)?.remove();
            closeMoreMenus();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (filterMenu && !filterMenu.hidden) closeFilterMenu();
        if (detailModal && !detailModal.hidden) closeDetailModal();
        if (confirmModal && !confirmModal.hidden) closeConfirmModal();
        closeMoreMenus();
    });

    setActiveTab("quotes");
    await loadEstimations();
});
