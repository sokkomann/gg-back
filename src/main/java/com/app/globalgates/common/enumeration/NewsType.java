package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsType {
    GENERAL("general"), EMERGENCY("emergency");

    private final String value;

    private static final Map<String, NewsType> NEWS_TYPE_MAP =
            Arrays.stream(NewsType.values()).collect(Collectors.toMap(NewsType::getValue, Function.identity()));

    @JsonCreator
    NewsType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static NewsType getNewsType(String value) {
        return NEWS_TYPE_MAP.get(value);
    }
}
