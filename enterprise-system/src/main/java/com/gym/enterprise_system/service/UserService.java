package com.gym.enterprise_system.service;

import com.gym.enterprise_system.dto.LoginDto;
import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.User;

public interface UserService {
    User registerUser(UserRegistrationDto registrationDto);

    User login(LoginDto loginDto);
}