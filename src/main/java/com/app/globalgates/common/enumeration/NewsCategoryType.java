package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsCategoryType {
    TRADE("trade"), MARKET("market"), POLICY("policy"), TECHNOLOGY("technology"), ETC("etc");

    private final String value;

    private static final Map<String, NewsCategoryType> NEWS_CATEGORY_TYPE_MAP =
            Arrays.stream(NewsCategoryType.values()).collect(Collectors.toMap(NewsCategoryType::getValue, Function.identity()));

    @JsonCreator
    NewsCategoryType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static NewsCategoryType getNewsCategoryType(String value) {
        return NEWS_CATEGORY_TYPE_MAP.get(value);
    }
}
