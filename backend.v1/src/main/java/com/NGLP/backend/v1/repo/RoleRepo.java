package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepo extends JpaRepository<Role, Long> {
}
