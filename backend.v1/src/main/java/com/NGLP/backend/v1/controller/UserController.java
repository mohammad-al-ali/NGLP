package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping
    public List<User> getAll() { return userService.findAll(); }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) { return userService.findById(id); }

    @PostMapping
    public User create(@RequestBody User user) { return userService.create(user); }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) { return userService.update(id, user); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
