package com.server.realsync.dto;

public record CustomerGroupDTO(
    Integer id,
    String name,
    Long customerCount
) {}