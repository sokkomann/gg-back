const exploreLayout = (() => {
    // 추천 제품 렌더링 (ProductsPagingDTO)
    const showPostList = (productsPagingDTO) => {
        const section = document.getElementById("productsSection");
        if (!section) return;

        section.innerHTML = "";

        const posts = productsPagingDTO.posts;

        if (!posts || posts.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 상품이 없습니다.</p>`;
            return;
        }

        posts.forEach(post => {
            const firstImage = post.postFiles?.[0] ?? "/images/main/global-gates-logo.png";

            const hashtags = (post.hashtags ?? [])
                .map(tag => `<span class="Category-Tag">#${tag.hashtag ?? tag}</span>`)
                .join("");

            const card = document.createElement("div");
            card.className = "Post-Card";
            card.dataset.type = "image-1";
            card.dataset.postId = post.id;

            card.innerHTML = `
                <div class="Post-Body">
                    <div class="Post-Header">
                        <div class="Post-Avatar-Wrapper">
                            <div class="Post-Avatar">판</div>
                        </div>
                        <div class="Post-Identity">
                            <strong class="Post-Name">${post.memberNickname}</strong>
                            <div>
                                <span class="Post-Handle">${post.memberHandle}</span>
                                <span class="Post-Time">${post.createdDatetime}</span>
                            </div>
                        </div>
                    </div>
                    <strong class="Post-Title">${post.postTitle ?? ""}</strong>
                    <span class="Post-Category">${post.id ?? ""}</span>
                    <div class="Post-Product-Info">
                        <div class="Post-Product-Image">
                            <img class="Post-Media-Img" src="${firstImage}" alt="${post.postTitle ?? "상품 이미지"}">
                        </div>
                        <div class="Post-Product-Detail">
                            <div class="Detail-Category-Tags">${hashtags}</div>
                            <span name="stock" class="Detail-Value">수량: ${post.productStock ?? 0}</span>
                            <span name="price" class="Detail-Value">가격: ${Number(post.productPrice ?? 0).toLocaleString()}원</span>
                        </div>
                    </div>
                    <p class="Post-Text">${post.postContent ?? ""}</p>
                    <div class="Post-Metrics">
                        <div class="Post-Action-Bar">
                            <button class="Post-Action-Btn Like" aria-label="좋아요">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                    <g><path
                                        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                                        data-path-inactive="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                                        data-path-active="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z">
                                    </path></g>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <button class="Post-Action-Btn" aria-label="조회수">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <div class="Post-Action-Right">
                                <button class="Post-Action-Btn Bookmark" aria-label="북마크">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                        <g><path
                                            d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                            data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                            data-path-active="M4 4.5C4 3.12 5.119 2 20 4.5v18.44l-8-5.71-8 5.71V4.5z">
                                        </path></g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            section.appendChild(card);
        });
    };

    // ─── 뉴스 렌더링 (List<NewsDTO>) ─────────────────────────
    const showNewsList = (newsList) => {
        const section = document.getElementById("newsSection");
        if (!section) return;

        section.innerHTML = "";

        if (!newsList || newsList.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 뉴스가 없습니다.</p>`;
            return;
        }

        const trendList = document.createElement("div");
        trendList.className = "trend-list";

        newsList.forEach(news => {
            const cell = document.createElement("div");
            cell.className = "cell-inner-div";
            cell.innerHTML = `
                <div class="trend" role="link" tabindex="0" data-news-id="${news.id}">
                    <div class="trend-inner">
                        <div class="trend-title-row">
                            <div class="trend-title-wrap">
                                <span class="trend-title">${news.newsTitle ?? ""}</span>
                            </div>
                        </div>
                        <div class="trend-meta-row">
                            <span class="trend-meta-text">${news.createdDatetime}</span>
                        </div>
                    </div>
                </div>
            `;
            trendList.appendChild(cell);
        });

        section.appendChild(trendList);
    };

    // ─── 실시간 검색어 렌더링 (List<RankedSearchHistoryDTO>) ──
    const showTrends = (trends) => {
        const section = document.getElementById("trendingSection");
        if (!section) return;

        section.innerHTML = "";

        if (!trends || trends.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 트렌드가 없습니다.</p>`;
            return;
        }

        const trendingList = document.createElement("div");
        trendingList.className = "trending-list";

        trends.forEach(trend => {
            const item = document.createElement("div");
            item.className = "trending-item";
            item.setAttribute("role", "link");
            item.setAttribute("tabindex", "0");
            item.innerHTML = `
                <div class="trending-body">
                    <div class="trending-meta">
                        <span>${trend.ranking}</span>
                        <span class="trending-dot">·</span>
                        <span>Trending in South Korea</span>
                    </div>
                    <div class="trending-title">${trend.searchKeyword}</div>
                </div>
                <button class="trending-more-btn" aria-label="More">
                    <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                        <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                </button>
            `;
            trendingList.appendChild(item);
        });

        section.appendChild(trendingList);
    };

    return { showPostList: showPostList, showNewsList: showNewsList, showTrends: showTrends };
})();