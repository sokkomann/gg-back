window.addEventListener("load", () => {
    const createPostButton = document.getElementById("createPostButton");
    const composerForm = document.getElementById("postComposerForm");
    const submitButton = document.getElementById("postSubmitButton");
    const productSelectButton = document.getElementById("productSelectButton");
    const productSelectModal = document.getElementById("productSelectModal");
    const productSelectBackdrop = document.getElementById("productSelectBackdrop");
    const productSelectClose = document.getElementById("productSelectClose");
    const productSelectConfirm = document.getElementById("productSelectConfirm");
    const productSelectList = document.getElementById("productSelectList");
    const productItems = Array.from(
        document.querySelectorAll("#productSelectList .productSelectModal__item"),
    );
    const productSelectEmpty = document.getElementById("productSelectEmpty");
    const selectedProductPreview = document.getElementById("selectedProductPreview");
    const selectedProductImage = document.getElementById("selectedProductImage");
    const selectedProductName = document.getElementById("selectedProductName");
    const selectedProductMeta = document.getElementById("selectedProductMeta");
    const selectedProductRemove = document.getElementById("selectedProductRemove");
    const userLinkButton = document.getElementById("composerUserLinkButton");
    const linkedProfile = document.getElementById("composerLinkedProfile");
    const linkedProfileAvatar = document.getElementById("composerLinkedProfileAvatar");
    const linkedProfileEmail = document.getElementById("composerLinkedProfileEmail");
    const shareChatSheet = document.getElementById("estimationShareChatSheet");
    const shareChatSearch = document.getElementById("estimationShareChatSearch");
    const shareChatCloseButtons = Array.from(
        document.querySelectorAll("[data-estimation-share-close]"),
    );
    const shareUserButtons = Array.from(
        document.querySelectorAll("#estimationShareChatUserList .share-sheet__user"),
    );
    const titleInput = document.querySelector('input[name="postName"]');
    const summaryInput = document.querySelector('input[name="postPrice"]');
    const contentInput = document.querySelector('textarea[name="postContent"]');
    const tagInput = document.getElementById("devTags");
    const tagsHiddenInput = document.querySelector('input[name="tags"]');
    const requiredFields = [titleInput, summaryInput, contentInput].filter(Boolean);

    let selectedProductId = "";
    let selectedReceiverEmail = "";

    const safeText = (value, fallback = "") => (value || fallback).trim();

    const parseTags = (value) =>
        value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .map((tag) => tag.replace(/^#/, ""))
            .filter((tag, index, array) => array.indexOf(tag) === index)
            .map((tag) => ({ tagName: tag }));

    const syncHiddenTags = () => {
        if (!tagInput || !tagsHiddenInput) {
            return;
        }

        const normalized = parseTags(tagInput.value)
            .map((tag) => `#${tag.tagName}`)
            .join(", ");
        tagsHiddenInput.value = normalized;
    };

    const syncSubmitState = () => {
        if (!submitButton) {
            return;
        }

        const hasRequiredValues = requiredFields.every((field) => field.value.trim());
        submitButton.disabled = !hasRequiredValues || !selectedProductId;
    };

    const renderSelectedProduct = () => {
        if (!selectedProductPreview) {
            return;
        }

        const product = productItems.find((item) => item.dataset.productId === selectedProductId);
        if (!product || !selectedProductImage || !selectedProductName || !selectedProductMeta) {
            selectedProductPreview.hidden = true;
            syncSubmitState();
            return;
        }

        selectedProductPreview.hidden = false;
        selectedProductImage.src = product.dataset.productImage || "";
        selectedProductImage.alt = product.dataset.productName || "";
        selectedProductName.textContent = product.dataset.productName || "";
        selectedProductMeta.textContent = product.dataset.productMeta || "";
        syncSubmitState();
    };

    const syncProductSelection = () => {
        if (!productSelectConfirm) {
            return;
        }

        if (productSelectEmpty) {
            productSelectEmpty.hidden = productItems.length > 0;
        }

        productItems.forEach((item) => {
            const isSelected = item.dataset.productId === selectedProductId;
            item.classList.toggle("is-selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });

        productSelectConfirm.disabled = !selectedProductId;
    };

    const openProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        syncProductSelection();
        productSelectModal.hidden = false;
    };

    const closeProductSelectModal = () => {
        if (!productSelectModal) {
            return;
        }

        productSelectModal.hidden = true;
    };

    const openShareChatSheet = () => {
        if (shareChatSheet) {
            shareChatSheet.hidden = false;
        }
    };

    const closeShareChatSheet = () => {
        if (shareChatSheet) {
            shareChatSheet.hidden = true;
        }
    };

    const syncShareUsers = () => {
        const keyword = shareChatSearch?.value.trim().toLowerCase() || "";

        shareUserButtons.forEach((button) => {
            const name = (button.dataset.shareUserName || "").toLowerCase();
            const email = (button.dataset.shareUserEmail || "").toLowerCase();
            button.hidden = Boolean(keyword) && !name.includes(keyword) && !email.includes(keyword);
        });
    };

    const selectLinkedProfile = (button) => {
        if (!linkedProfile || !linkedProfileAvatar || !linkedProfileEmail) {
            return;
        }

        selectedReceiverEmail = button.dataset.shareUserEmail || "";
        linkedProfile.hidden = false;
        linkedProfile.setAttribute("aria-hidden", "false");
        linkedProfileAvatar.src = button.dataset.shareUserAvatar || "";
        linkedProfileAvatar.alt = button.dataset.shareUserName || "";
        linkedProfileEmail.textContent = selectedReceiverEmail || "unknown";
        closeShareChatSheet();
    };

    const openComposerModal = () => {
        const composerModalOverlay = document.getElementById("composerModalOverlay");
        const composerSection = document.getElementById("composerSection");
        if (composerModalOverlay) composerModalOverlay.hidden = false;
        if (composerSection) composerSection.hidden = false;
    };

    const closeComposerModal = () => {
        const composerModalOverlay = document.getElementById("composerModalOverlay");
        const composerSection = document.getElementById("composerSection");
        if (composerModalOverlay) composerModalOverlay.hidden = true;
        if (composerSection) composerSection.hidden = true;
    };

    const buildPayload = () => {
        const descriptionParts = [
            safeText(summaryInput?.value),
            safeText(contentInput?.value),
        ].filter(Boolean);

        return {
            requesterId: 1,
            receiverId: null,
            productId: selectedProductId ? Number(selectedProductId) : null,
            title: safeText(titleInput?.value),
            content: descriptionParts.join("\n"),
            deadLine: null,
            status: "requesting",
            receiverEmail: selectedReceiverEmail || null,
            tags: parseTags(tagInput?.value || ""),
        };
    };

    const resetForm = () => {
        composerForm?.reset();
        selectedProductId = "";
        selectedReceiverEmail = "";
        tagsHiddenInput && (tagsHiddenInput.value = "");
        if (linkedProfile) {
            linkedProfile.hidden = true;
            linkedProfile.setAttribute("aria-hidden", "true");
        }
        renderSelectedProduct();
        syncProductSelection();
        syncSubmitState();
    };

    const submitEstimation = async () => {
        const payload = buildPayload();

        if (!payload.title || !payload.content || !payload.productId) {
            alert("제목, 내용, 상품을 먼저 입력해 주세요.");
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch("/api/estimations/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`견적 요청 저장 실패 (${response.status})`);
            }

            alert("견적 요청이 저장되었습니다.");
            resetForm();
            window.location.href = "/estimation/list";
        } catch (error) {
            console.error(error);
            alert("견적 요청 저장 중 오류가 발생했습니다.");
            syncSubmitState();
        }
    };

    if (!createPostButton) {
        return;
    }

    requiredFields.forEach((field) => {
        field.addEventListener("input", syncSubmitState);
    });

    tagInput?.addEventListener("input", () => {
        syncHiddenTags();
        syncSubmitState();
    });

    productSelectButton?.addEventListener("click", openProductSelectModal);
    productSelectClose?.addEventListener("click", closeProductSelectModal);
    productSelectBackdrop?.addEventListener("click", closeProductSelectModal);
    productSelectConfirm?.addEventListener("click", () => {
        renderSelectedProduct();
        closeProductSelectModal();
    });
    selectedProductRemove?.addEventListener("click", () => {
        selectedProductId = "";
        renderSelectedProduct();
        syncProductSelection();
    });
    userLinkButton?.addEventListener("click", openShareChatSheet);
    shareChatCloseButtons.forEach((button) => {
        button.addEventListener("click", closeShareChatSheet);
    });
    shareChatSearch?.addEventListener("input", syncShareUsers);
    shareUserButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectLinkedProfile(button);
        });
    });
    productSelectList?.addEventListener("click", (event) => {
        const item = event.target.closest("[data-product-id]");
        if (!(item instanceof HTMLElement)) {
            return;
        }

        selectedProductId = item.dataset.productId || "";
        syncProductSelection();
    });

    composerForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitEstimation();
    });

    createPostButton.addEventListener("click", openComposerModal);
    document.getElementById("composerModalClose")?.addEventListener("click", closeComposerModal);
    document.getElementById("composerModalOverlay")?.addEventListener("click", closeComposerModal);

    syncHiddenTags();
    syncSubmitState();
    syncProductSelection();
    renderSelectedProduct();
    syncShareUsers();

    window.setTimeout(openComposerModal, 0);
    window.setTimeout(() => {
        createPostButton.click();
    }, 0);
});
