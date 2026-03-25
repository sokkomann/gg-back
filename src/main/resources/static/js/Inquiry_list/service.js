const inquiryListService = (() => {
    const getInquiryMembers = async (page, categoryName, callback) => {
        const response = fetch(`/api/member-list/${page}?categoryName=${categoryName}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const inquiryMemberPagingDTO = await response.json;

        if(callback) callback(inquiryMemberPagingDTO);

        return inquiryMemberPagingDTO.criteria;
    }

    return {
        getInquiryMembers: getInquiryMembers
    };
})();