package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.AuthRoleRequestDto;
import com.matricula_universitaria.dto.AuthRoleResponseDto;
import com.matricula_universitaria.service.AuthRoleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/auth/roles")
public class AuthRoleController {

    private final AuthRoleService roleService;

    public AuthRoleController(AuthRoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    public ResponseEntity<AuthRoleResponseDto> crear(@Valid @RequestBody AuthRoleRequestDto request) {
        AuthRoleResponseDto creado = roleService.crear(request);
        return ResponseEntity.created(URI.create("/api/auth/roles/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthRoleResponseDto> actualizar(@PathVariable Long id,
                                                          @Valid @RequestBody AuthRoleRequestDto request) {
        AuthRoleResponseDto actualizado = roleService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        roleService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthRoleResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AuthRoleResponseDto>> listar() {
        return ResponseEntity.ok(roleService.listarTodos());
    }

    @GetMapping("/with-permissions")
    public ResponseEntity<List<AuthRoleResponseDto>> listarConPermisos() {
        return ResponseEntity.ok(roleService.listarTodosConPermisos());
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<AuthRoleResponseDto> asignarPermiso(@PathVariable Long roleId,
                                                               @PathVariable Long permissionId) {
        return ResponseEntity.ok(roleService.asignarPermiso(roleId, permissionId));
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<AuthRoleResponseDto> removerPermiso(@PathVariable Long roleId,
                                                               @PathVariable Long permissionId) {
        return ResponseEntity.ok(roleService.removerPermiso(roleId, permissionId));
    }
}
