package com.gym.enterprise_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EnterpriseSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(EnterpriseSystemApplication.class, args);
	}

}
