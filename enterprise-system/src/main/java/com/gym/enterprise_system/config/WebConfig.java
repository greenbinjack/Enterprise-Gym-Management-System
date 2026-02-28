package com.gym.enterprise_system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // When React asks for http://localhost:8080/uploads/..., serve the local file!
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}