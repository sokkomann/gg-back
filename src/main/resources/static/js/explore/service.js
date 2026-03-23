const exploreService = (() => {
    // 추천 상품 요청
    const getRecommends = async (page, callback) => {
        const response = await fetch(`/api/explore/products/${page}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const productWithPagingDTO = await response.json();
        if (callback) callback(productWithPagingDTO);

        return productWithPagingDTO.criteria;
    }

    // 뉴스 요청
    const getNews = async (callback) => {
        const response = await fetch(`/api/explore/news`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const news = await response.json();
        if (callback) callback(news);
    }

    // 실시간 검색어 요청
    const getTrends = async (callback) => {
        const response = await fetch(`/api/explore/trends`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const trends = await response.json();
        if (callback) callback(trends);
    }


    return {getRecommends: getRecommends, getNews: getNews, getTrends: getTrends};
})();
