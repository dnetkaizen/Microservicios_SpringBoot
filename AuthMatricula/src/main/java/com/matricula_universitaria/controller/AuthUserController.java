package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.AuthUserRequestDto;
import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.service.AuthUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/auth/users")
public class AuthUserController {

    private final AuthUserService userService;

    public AuthUserController(AuthUserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<AuthUserResponseDto> crear(@Valid @RequestBody AuthUserRequestDto request) {
        AuthUserResponseDto creado = userService.crear(request);
        return ResponseEntity.created(URI.create("/api/auth/users/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthUserResponseDto> actualizar(@PathVariable Long id,
                                                          @Valid @RequestBody AuthUserRequestDto request) {
        AuthUserResponseDto actualizado = userService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        userService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthUserResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(userService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AuthUserResponseDto>> listar() {
        return ResponseEntity.ok(userService.listarTodos());
    }

    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<AuthUserResponseDto> asignarRol(@PathVariable Long userId,
                                                          @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.asignarRol(userId, roleId));
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<AuthUserResponseDto> removerRol(@PathVariable Long userId,
                                                          @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.removerRol(userId, roleId));
    }
}
