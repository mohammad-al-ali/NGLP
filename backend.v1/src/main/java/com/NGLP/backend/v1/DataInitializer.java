package com.NGLP.backend.v1;

import com.NGLP.backend.v1.entity.Role;
import com.NGLP.backend.v1.repo.RoleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final RoleRepo roleRepo;

    @Override
    public void run(String... args) {
        seedRole("ROLE_STUDENT", "Student learner account");
        seedRole("ROLE_TEACHER", "Teacher course creator account");
        seedRole("ROLE_ADMIN", "Administrator account");
    }

    private void seedRole(String name, String description) {
        roleRepo.findByName(name).orElseGet(() -> roleRepo.save(Role.builder()
                .name(name)
                .description(description)
                .build()));
    }
}
