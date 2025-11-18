package com.matricula_universitaria.events.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdatedEvent {

    private Long userId;
    private String username;
    private String email;
    private List<String> roles;
    private Instant eventTimestamp;
}
