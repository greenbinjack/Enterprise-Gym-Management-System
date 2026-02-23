package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.dto.LoginDto;
import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.Role;
import com.gym.enterprise_system.entity.Subscription;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.mapper.UserMapper;
import com.gym.enterprise_system.repository.SubscriptionRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor // Lombok: Auto-creates a constructor for our injected dependencies
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SubscriptionRepository subscriptionRepository; // ADD THIS

    // We will inject the real BCryptPasswordEncoder later when we set up Auth
    // private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = userMapper.toEntity(registrationDto);
        user.setPasswordHash("[BCRYPT_HASH_SIMULATION]_" + registrationDto.getPassword());
        user.setRole(Role.MEMBER);
        User savedUser = userRepository.save(user);

        // ADD THIS: Create a pending subscription immediately upon registration
        Subscription pendingSub = Subscription.builder()
                .user(savedUser)
                .status("PENDING")
                .build();
        subscriptionRepository.save(pendingSub);

        return savedUser;
    }

    @Override
    public User login(LoginDto loginDto) {
        // 1. Find user by email
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 2. Check password (using our simulated hash from earlier)
        String expectedHash = "[BCRYPT_HASH_SIMULATION]_" + loginDto.getPassword();
        if (!user.getPasswordHash().equals(expectedHash)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }
}