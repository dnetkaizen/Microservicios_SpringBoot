package com.matricula_universitaria.dto;

import java.util.Set;

public record JwtResponse(
        String token,
        String type,
        String username,
        String email,
        Set<String> roles
) {
}
