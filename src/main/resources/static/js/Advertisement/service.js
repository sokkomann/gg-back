const advertisementService = (() => {
    const write = async (formState, attachments, bootpayResult, memberId) => {
        const formData = new FormData();

        // AdvertisementDTO
        formData.append("title",              formState.adTitle);
        formData.append("headline",           formState.headline);
        formData.append("description",        formState.adBody);
        formData.append("landingUrl",         formState.landingUrl);
        formData.append("budget",             formState.budget);
        formData.append("impressionEstimate", estimateImpressions(formState.budget));

        // FileAdvertisementDTO → adImageList
        attachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("adImageList", attachment.file);
            }
        });

        // PaymentAdvertisementDTO
        formData.append("payment.memberId",      memberId);
        formData.append("payment.amount",        bootpayResult.price);
        formData.append("payment.paymentMethod", bootpayResult.method);
        formData.append("payment.receiptId",     bootpayResult.receipt_id);
        formData.append("payment.paidAt",        bootpayResult.purchased_at);
        formData.append("payment.paymentStatus", "PAID");

        const response = await fetch("/api/advertisement", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("광고 등록 실패");
        return response.json();
    };

    const list = async (page, callback) => {
        const response = await fetch(`/api/ad/list/${page}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const adWithPagingDTO = await response.json();

        if(callback) {
            callback(adWithPagingDTO);
        }
    }

    return {write: write, list: list};
})();