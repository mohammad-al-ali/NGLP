package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User ,Long> {
}
