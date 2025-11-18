package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.dto.JwtResponse;
import com.matricula_universitaria.dto.LoginRequest;
import com.matricula_universitaria.dto.RegisterRequest;

public interface AuthAuthenticationService {

    AuthUserResponseDto register(RegisterRequest request);

    JwtResponse login(LoginRequest request);

    AuthUserResponseDto me(String usernameOrEmail);
}
