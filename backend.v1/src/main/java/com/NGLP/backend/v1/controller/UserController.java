package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ❌ تم حذف getAll() نهائياً لحماية بيانات الطلاب!
    // ❌ تم حذف delete() لمنع مسح الحسابات وتدمير العلاقات في قاعدة البيانات.

    /**
     * 1. جلب بيانات المستخدم (تُستخدم لعرض صفحة الملف الشخصي Profile)
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * 2. إنشاء حساب جديد (Registration)
     * غيرنا المسار إلى /register ليكون أكثر وضوحاً واحترافية
     */
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.create(user));
    }

    /**
     * 3. تحديث الملف الشخصي (آمنة: تحدث الاسم والإيميل فقط)
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }
}
