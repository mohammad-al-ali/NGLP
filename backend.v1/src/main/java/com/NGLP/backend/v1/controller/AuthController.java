package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.dto.AuthRequest;
import com.NGLP.backend.v1.dto.AuthResponse;
import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userService.authenticate(request.email(), request.password());
        String tokenPayload = user.getId() + ":" + user.getEmail();
        String token = Base64.getEncoder().encodeToString(tokenPayload.getBytes(StandardCharsets.UTF_8));
        return ResponseEntity.ok(new AuthResponse(user, token));
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(@RequestParam Long userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }
}
