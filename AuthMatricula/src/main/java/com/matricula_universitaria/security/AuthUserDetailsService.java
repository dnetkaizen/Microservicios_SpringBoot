package com.matricula_universitaria.security;

import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthRolePermission;
import com.matricula_universitaria.entity.AuthUser;
import com.matricula_universitaria.entity.AuthUserRole;
import com.matricula_universitaria.repository.AuthUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthUserDetailsService implements UserDetailsService {

    private final AuthUserRepository userRepository;

    public AuthUserDetailsService(AuthUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        AuthUser user = userRepository.findByUsernameIgnoreCase(usernameOrEmail)
                .or(() -> userRepository.findByEmailIgnoreCase(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + usernameOrEmail));

        Set<GrantedAuthority> authorities = buildAuthorities(user);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getActivo()),
                true,
                true,
                true,
                authorities
        );
    }

    private Set<GrantedAuthority> buildAuthorities(AuthUser user) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        for (AuthUserRole userRole : user.getUserRoles()) {
            AuthRole role = userRole.getRole();
            if (role == null) {
                continue;
            }
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getNombre()));

            if (role.getRolePermissions() != null) {
                authorities.addAll(
                        role.getRolePermissions().stream()
                                .map(AuthRolePermission::getPermission)
                                .filter(p -> p != null && p.getNombre() != null)
                                .map(p -> new SimpleGrantedAuthority(p.getNombre()))
                                .collect(Collectors.toSet())
                );
            }
        }

        return authorities;
    }
}
