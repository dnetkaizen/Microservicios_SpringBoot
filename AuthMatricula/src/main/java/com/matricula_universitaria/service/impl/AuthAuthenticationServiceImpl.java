package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.dto.GoogleLoginRequest;
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
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.matricula_universitaria.service.AuthAuthenticationService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
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
    private final FirebaseAuth firebaseAuth;

    public AuthAuthenticationServiceImpl(AuthUserRepository userRepository,
                                         AuthRoleRepository roleRepository,
                                         AuthUserRoleRepository userRoleRepository,
                                         PasswordEncoder passwordEncoder,
                                         AuthenticationManager authenticationManager,
                                         JwtUtil jwtUtil,
                                         AuthUserMapper userMapper,
                                         UserCreatedProducer userCreatedProducer,
                                         FirebaseAuth firebaseAuth) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.userCreatedProducer = userCreatedProducer;
        this.firebaseAuth = firebaseAuth;
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
    public JwtResponse loginWithGoogle(GoogleLoginRequest request) {
        if (request == null || request.idToken() == null || request.idToken().isBlank()) {
            throw new BadRequestException("El idToken de Google es requerido");
        }

        FirebaseToken firebaseToken;
        try {
            firebaseToken = firebaseAuth.verifyIdToken(request.idToken());
        } catch (FirebaseAuthException ex) {
            throw new BadRequestException("Token de Google inválido o expirado");
        }

        String uid = firebaseToken.getUid();
        String email = firebaseToken.getEmail();
        String name = firebaseToken.getName();

        if ((email == null || email.isBlank()) && (name == null || name.isBlank())) {
            throw new BadRequestException("El token de Google no contiene información de usuario válida");
        }

        String username = (email != null && !email.isBlank()) ? email : name;
        String finalEmail = (email != null && !email.isBlank()) ? email : username;

        AuthUser user = userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> {
                    // Si no existe por firebaseUid, intentamos localizar por email
                    if (finalEmail != null && !finalEmail.isBlank()) {
                        return userRepository.findByEmailIgnoreCase(finalEmail)
                                .map(existing -> {
                                    existing.setFirebaseUid(uid);
                                    return userRepository.save(existing);
                                })
                                .orElseGet(() -> crearUsuarioDesdeFirebase(uid, username, finalEmail));
                    } else {
                        return crearUsuarioDesdeFirebase(uid, username, finalEmail);
                    }
                });

        String token = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        "", // no usamos password para este token
                        Boolean.TRUE.equals(user.getActivo()),
                        true,
                        true,
                        true,
                        java.util.Collections.emptyList()
                )
        );

        java.util.Set<String> roles = new java.util.HashSet<>(extractRoleNames(user));

        return new JwtResponse(
                token,
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }

    private AuthUser crearUsuarioDesdeFirebase(String uid, String username, String email) {
        AuthUser user = AuthUser.builder()
                .username(username)
                .email(email)
                .firebaseUid(uid)
                .build();

        AuthUser saved = userRepository.save(user);

        // Asignar rol "estudiante" por defecto a usuarios creados vía Google, si existe
        roleRepository.findByNombreIgnoreCase("estudiante").ifPresent(estudianteRole -> {
            AuthUserRoleId id = new AuthUserRoleId(saved.getId(), estudianteRole.getId());
            AuthUserRole ur = AuthUserRole.builder()
                    .id(id)
                    .user(saved)
                    .role(estudianteRole)
                    .build();
            // save() devuelve la instancia gestionada por el EntityManager;
            // usamos esa instancia para evitar tener dos objetos distintos con el mismo ID en la sesión.
            AuthUserRole managed = userRoleRepository.save(ur);
            saved.getUserRoles().add(managed);
        });

        UserCreatedEvent event = UserCreatedEvent.builder()
                .userId(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .roles(extractRoleNames(saved))
                .eventTimestamp(Instant.now())
                .build();
        userCreatedProducer.send(event);

        return saved;
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
        Set<AuthUserRole> roles = user.getUserRoles();
        if (roles == null || roles.isEmpty()) {
            return Collections.emptyList();
        }
        return roles.stream()
                .map(AuthUserRole::getRole)
                .filter(Objects::nonNull)
                .map(AuthRole::getNombre)
                .toList();
    }
}
