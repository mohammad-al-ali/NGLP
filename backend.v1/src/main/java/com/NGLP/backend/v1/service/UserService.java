package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.User;
import com.NGLP.backend.v1.repo.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;
    // لاحقاً سنحقن هنا: private final PasswordEncoder passwordEncoder;

    // تم حذف findAll() لحماية الخصوصية. (يمكن إضافتها لاحقاً بصلاحية ADMIN فقط)

    public User findById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with this"+ id));
    }

    // دالة إنشاء الحساب (التسجيل)
    public User create(User user) {
        // 1. التحقق من أن الإيميل غير مستخدم مسبقاً
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("هذا البريد الإلكتروني مستخدم بالفعل.");
        }

        // 2. تشفير كلمة المرور (مؤقتاً تعليق حتى نركب Spring Security)
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepo.save(user);
    }

    // دالة تحديث الملف الشخصي (آمنة: لا تسمح بتغيير الدور أو الباسورد هنا)
    public User updateProfile(Long id, User updatedUser) {
        return userRepo.findById(id).map(existing -> {

            // إذا أراد تغيير الإيميل، يجب التأكد أن الإيميل الجديد غير مأخوذ
            if (!existing.getEmail().equals(updatedUser.getEmail()) && userRepo.existsByEmail(updatedUser.getEmail())) {
                throw new IllegalArgumentException("البريد الإلكتروني الجديد مستخدم بالفعل.");
            }

            existing.setFullName(updatedUser.getFullName());
            existing.setEmail(updatedUser.getEmail());
            // لاحظ: لم نقم بتحديث Role ولا Password هنا لحماية النظام!

            return userRepo.save(existing);
        }).orElseThrow(() -> new EntityNotFoundException("Usernot found with this"+ id));
    }

    public void delete(Long id) {
        // ملاحظة: يُفضل في الأنظمة الحقيقية عمل Soft Delete (إخفاء المستخدم)
        // بدلاً من مسحه كلياً للحفاظ على تاريخ المحادثات والدروس.
        userRepo.deleteById(id);
    }
}

