package com.example.taskmanager.service;

import com.example.taskmanager.dto.AuthenticationRequest;
import com.example.taskmanager.dto.AuthenticationResponse;
import com.example.taskmanager.dto.RegisterRequest;
import com.example.taskmanager.model.Role;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    public AuthenticationService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }
    //Registration
    public AuthenticationResponse register (RegisterRequest request) {
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        repository.save(user);

        String jwt = jwtService.generateToken(user);
        return new AuthenticationResponse(jwt,user.getRole().name());
    }

    //Login
    public AuthenticationResponse authenticate(AuthenticationRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(),request.password())
        );
        User user = repository.findByUsername(request.username()).orElseThrow(()->new RuntimeException("User not found"));
        String jwt = jwtService.generateToken(user);
        return new AuthenticationResponse(jwt,user.getRole().name());
    }


}
