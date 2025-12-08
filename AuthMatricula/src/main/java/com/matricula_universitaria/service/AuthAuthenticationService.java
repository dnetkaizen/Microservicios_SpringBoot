package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.dto.JwtResponse;
import com.matricula_universitaria.dto.LoginRequest;
import com.matricula_universitaria.dto.RegisterRequest;
import com.matricula_universitaria.dto.GoogleLoginRequest;

public interface AuthAuthenticationService {

    AuthUserResponseDto register(RegisterRequest request);

    JwtResponse login(LoginRequest request);

    JwtResponse loginWithGoogle(GoogleLoginRequest request);

    AuthUserResponseDto me(String usernameOrEmail);
}
