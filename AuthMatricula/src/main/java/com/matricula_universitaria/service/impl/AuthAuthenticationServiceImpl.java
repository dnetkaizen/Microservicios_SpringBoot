package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.dto.JwtResponse;
import com.matricula_universitaria.dto.LoginRequest;
import com.matricula_universitaria.dto.RegisterRequest;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthUser;
import com.matricula_universitaria.entity.AuthUserRole;
import com.matricula_universitaria.entity.AuthUserRoleId;
import com.matricula_universitaria.events.dto.UserCreatedEvent;
import com.matricula_universitaria.events.producer.UserCreatedProducer;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.AuthUserMapper;
import com.matricula_universitaria.repository.AuthRoleRepository;
import com.matricula_universitaria.repository.AuthUserRepository;
import com.matricula_universitaria.repository.AuthUserRoleRepository;
import com.matricula_universitaria.security.jwt.JwtUtil;
import com.matricula_universitaria.service.AuthAuthenticationService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthAuthenticationServiceImpl implements AuthAuthenticationService {

    private final AuthUserRepository userRepository;
    private final AuthRoleRepository roleRepository;
    private final AuthUserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuthUserMapper userMapper;
    private final UserCreatedProducer userCreatedProducer;

    public AuthAuthenticationServiceImpl(AuthUserRepository userRepository,
                                         AuthRoleRepository roleRepository,
                                         AuthUserRoleRepository userRoleRepository,
                                         PasswordEncoder passwordEncoder,
                                         AuthenticationManager authenticationManager,
                                         JwtUtil jwtUtil,
                                         AuthUserMapper userMapper,
                                         UserCreatedProducer userCreatedProducer) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.userCreatedProducer = userCreatedProducer;
    }

    @Override
    public AuthUserResponseDto register(RegisterRequest request) {
        userRepository.findByUsernameIgnoreCase(request.username())
                .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con username " + request.username()); });
        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con email " + request.email()); });

        AuthUser user = AuthUser.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        AuthUser saved = userRepository.save(user);

        UserCreatedEvent event = UserCreatedEvent.builder()
                .userId(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .roles(extractRoleNames(saved))
                .eventTimestamp(Instant.now())
                .build();
        userCreatedProducer.send(event);

        return userMapper.toResponseDto(saved);
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        AuthUser user = userRepository.findByUsernameIgnoreCase(userDetails.getUsername())
                .orElseGet(() -> userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado")));

        Set<String> roles = user.getUserRoles().stream()
                .map(AuthUserRole::getRole)
                .filter(Objects::nonNull)
                .map(AuthRole::getNombre)
                .collect(Collectors.toSet());

        return new JwtResponse(
                token,
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUserResponseDto me(String usernameOrEmail) {
        AuthUser user = userRepository.findByUsernameIgnoreCase(usernameOrEmail)
                .or(() -> userRepository.findByEmailIgnoreCase(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return userMapper.toResponseDto(user);
    }

    private List<String> extractRoleNames(AuthUser user) {
        return user.getUserRoles().stream()
                .map(AuthUserRole::getRole)
                .filter(Objects::nonNull)
                .map(AuthRole::getNombre)
                .toList();
    }
}
