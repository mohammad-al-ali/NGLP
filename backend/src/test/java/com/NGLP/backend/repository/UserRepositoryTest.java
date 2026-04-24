package com.NGLP.backend.repository;

import com.NGLP.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveUser() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(User.Role.STUDENT)
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("testuser");
    }

    @Test
    void testFindByUsername() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(User.Role.STUDENT)
                .build();

        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByUsername("testuser");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    void testFindByEmail() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(User.Role.STUDENT)
                .build();

        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }
}