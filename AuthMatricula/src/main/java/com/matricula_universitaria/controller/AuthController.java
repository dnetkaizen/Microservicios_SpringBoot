package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.dto.JwtResponse;
import com.matricula_universitaria.dto.LoginRequest;
import com.matricula_universitaria.dto.RegisterRequest;
import com.matricula_universitaria.service.AuthAuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthAuthenticationService authService;

    public AuthController(AuthAuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthUserResponseDto> register(@Valid @RequestBody RegisterRequest request) {
        AuthUserResponseDto creado = authService.register(request);
        return ResponseEntity.created(URI.create("/api/auth/users/" + creado.id())).body(creado);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwt = authService.login(request);
        return ResponseEntity.ok(jwt);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponseDto> me(Authentication authentication) {
        String username = authentication.getName();
        AuthUserResponseDto dto = authService.me(username);
        return ResponseEntity.ok(dto);
    }
}
