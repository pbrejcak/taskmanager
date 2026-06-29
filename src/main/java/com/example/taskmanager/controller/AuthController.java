package com.example.taskmanager.controller;


import com.example.taskmanager.dto.AuthenticationRequest;
import com.example.taskmanager.dto.AuthenticationResponse;
import com.example.taskmanager.dto.RegisterRequest;
import com.example.taskmanager.security.LoginAttemptService;
import com.example.taskmanager.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private LoginAttemptService loginAttemptService;

    private final AuthenticationService service;

    public AuthController(AuthenticationService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register (@RequestBody RegisterRequest request){
        AuthenticationResponse response = service.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        String username = request.username();

        if (loginAttemptService.isBlocked(username)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Účet je dočasne zablokovaný. Počkajte 30 sekúnd.");
        }

        try {
            AuthenticationResponse response = service.authenticate(request);
            loginAttemptService.loginSucceeded(username);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            loginAttemptService.loginFailed(username);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Zlé meno alebo heslo.");
        }
    }

}
