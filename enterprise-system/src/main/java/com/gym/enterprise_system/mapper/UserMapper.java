package com.gym.enterprise_system.mapper;

import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// componentModel = "spring" tells Spring to manage this class as a Bean
@Mapper(componentModel = "spring")
public interface UserMapper {

    // Ignore fields that are auto-generated or handled securely by the backend
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    User toEntity(UserRegistrationDto registrationDto);
}