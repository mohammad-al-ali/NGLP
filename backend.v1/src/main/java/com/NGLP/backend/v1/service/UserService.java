package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) { this.userRepo = userRepo; }

    public List<User> findAll() { return userRepo.findAll(); }

    public User findById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User create(User user) { return userRepo.save(user); }

    public User update(Long id, User user) {
        return userRepo.findById(id).map(existing -> {
            existing.setFullName(user.getFullName());
            existing.setEmail(user.getEmail());
            existing.setPassword(user.getPassword());
            existing.setRole(user.getRole());
            return userRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public void delete(Long id) { userRepo.deleteById(id); }
}

