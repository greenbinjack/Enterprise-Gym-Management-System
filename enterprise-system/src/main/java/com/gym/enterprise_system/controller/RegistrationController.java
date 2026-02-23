package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Changed from @Controller. This automatically converts responses to JSON.
@RequestMapping("/api/register") // Standard practice to prefix API routes with /api
@RequiredArgsConstructor
public class RegistrationController {

    private final UserService userService;

    // We only need one POST method now. The React frontend will handle showing the
    // form.
    @PostMapping
    public ResponseEntity<?> registerUserAccount(@Valid @RequestBody UserRegistrationDto registrationDto) {
        // @RequestBody tells Spring to convert the incoming JSON from React into our
        // DTO

        try {
            User registeredUser = userService.registerUser(registrationDto);
            // Return a 201 Created status and a success message (or the user's ID)
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("User registered successfully with ID: " + registeredUser.getId());
        } catch (IllegalArgumentException e) {
            // If the email is already in the database, return a 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}