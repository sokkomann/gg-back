const advertisementLayout = (() => {
    const showAdList = (adWithPagingDTO) => {
        const tbody = document.querySelector('.MarketplaceAdTable tbody');
        const emptyState = document.querySelector('[data-list-empty]');

        const adList = adWithPagingDTO.adList; // AdWithPagingDTO 안의 광고 목록

        if (!adList || adList.length === 0) {
            tbody.replaceChildren();
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        const rows = adList.map((ad) => {
            const statusClass = ad.status === 'ACTIVE' ? 'is-active' : 'is-reported';
            const statusLabel = ad.status === 'ACTIVE' ? '게시중' : '신고됨';

            // adImageList → 첨부파일 표시용 텍스트 가공
            const attachmentLabel = (() => {
                if (!ad.adImageList || ad.adImageList.length === 0) return '선택된 파일이 없습니다.';
                if (ad.adImageList.length === 1) return ad.adImageList[0].originalName;
                return `${ad.adImageList[0].originalName} 외 ${ad.adImageList.length - 1}개`;
            })();

            // data-* 에 저장할 attachment 원본 정보 (JSON)
            const attachmentData = JSON.stringify(
                ad.adImageList?.map(({ id, originalName, fileName, filePath, contentType }) => ({
                    id, originalName, fileName, filePath, contentType
                })) ?? []
            );

            const tr = document.createElement('tr');
            tr.className = 'MarketplaceAdListRow';
            tr.dataset.adId        = ad.id;
            tr.dataset.title       = ad.title;
            tr.dataset.headline    = ad.headline;
            tr.dataset.link        = ad.landingUrl;       // landingUrl
            tr.dataset.attachment  = attachmentData;      // JSON 배열
            tr.dataset.copy        = ad.description;      // description
            tr.dataset.amount      = ad.budget;           // budget
            tr.dataset.status      = ad.status;
            tr.dataset.statusLabel = statusLabel;
            tr.dataset.createdAt   = ad.createdDatetime;
            tr.dataset.receiptId   = ad.receiptId ?? '-';

            tr.innerHTML = `
            <td data-cell="title">${ad.title}</td>
            <td data-cell="headline">${ad.headline}</td>
            <td data-cell="link">${ad.landingUrl}</td>
            <td data-cell="attachment">${attachmentLabel}</td>
            <td>
                <span class="MarketplaceAdStatusBadge ${statusClass}" data-cell="statusLabel">
                    ${statusLabel}
                </span>
            </td>
            <td data-cell="createdAt">${ad.createdDatetime}</td>
            <td>
                <div class="MarketplaceAdTableActions">
                    <button class="MarketplaceAdTextButton AdListDetailButton" type="button">상세</button>
                </div>
            </td>
        `;

            return tr;
        });

        tbody.replaceChildren(...rows);
    };

    return {showAdList: showAdList,};
})();