package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    /**
     * 1. جلب بيانات المستخدم (تُستخدم لعرض صفحة الملف الشخصي Profile)
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * 3. تحديث الملف الشخصي (آمنة: تحدث الاسم والإيميل فقط)
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<User> updateAdminFields(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateAdminFields(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
