package com.social.noble.kizup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Startup {

	public static void main(String[] args) {
		SpringApplication.run(Startup.class, args);

		System.out.println("App on http://127.0.0.1:8080\n\n");
	}

}
