const layout = (() => {
    // 더미 카드의 구조를 그대로 유지하되, 실제 데이터만 끼워 넣는다.
    const createMyProductCard = (product) => {
        const image = product.postFiles && product.postFiles.length > 0
            ? product.postFiles[0]
            : "/images/main/global-gates-logo.png";

        const hashtags = (product.hashtags ?? [])
            .map((tag) => `<span class="Category-Tag">#${tag.tagName}</span>`)
            .join("");

        return `
            <article class="Post-Card" data-type="image-1" data-product-id="${product.id}">
                <div class="Post-Body">
                    <header class="Post-Header">
                        <div class="Post-Identity">
                            <strong class="Post-Title">${product.postTitle ?? ""}</strong>
                            <span class="Post-Category">상품 번호 ${product.id ?? ""}</span>
                        </div>
                        <div class="Post-Identity">
                            <span class="Post-Time">${product.createdDatetime ?? ""}</span>
                            <button class="Post-More-Button" type="button" aria-label="더 보기" data-card-type="myproduct">
                                <svg class="Post-More-Icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <g>
                                        <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div class="Post-Product-Info">
                        <div class="Post-Product-Image">
                            <img src="${image}" alt="${product.postTitle ?? "상품 이미지"}">
                        </div>
                        <div class="Post-Product-Detail">
                            <div class="Detail-Category-Tags">${hashtags}</div>
                            <span name="stock" class="Detail-Value">수량 ${product.productStock ?? 0}</span>
                            <span name="price" class="Detail-Value">가격 ${Number(product.productPrice ?? 0).toLocaleString()}원</span>
                        </div>
                    </div>
                    <p class="Post-Text">${product.postContent ?? ""}</p>
                    <footer class="Post-Metrics">
                        <div class="Post-Action-Bar">
                            <button class="Post-Action-Btn Like" type="button" aria-label="좋아요 0">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <button class="Post-Action-Btn" type="button" aria-label="조회수 0">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <div class="Post-Action-Right">
                                <button class="Post-Action-Btn Bookmark" type="button" aria-label="북마크">
                                    <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </article>
        `;
    };

    // 다른 layout.js 파일들과 같은 방식으로
    // page가 1이면 기존 내용을 교체하고, 2페이지 이상이면 뒤에 이어 붙인다.
    const showMyProductList = (postProductWithPagingDTO, page) => {
        const productSection = document.querySelector(".Profile-Content.MyProducts .Profile-Content-List");
        if (!productSection) return;

        const products = postProductWithPagingDTO?.posts ?? [];
        const html = products.map(createMyProductCard).join("");

        if (products.length === 0 && page === 1) {
            productSection.innerHTML = `
                <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                    등록된 상품이 없습니다.
                </p>`;
            return;
        }

        if (page === 1) {
            productSection.innerHTML = html;
        } else {
            productSection.innerHTML += html;
        }
    };

    return {
        showMyProductList: showMyProductList
    };
})();
