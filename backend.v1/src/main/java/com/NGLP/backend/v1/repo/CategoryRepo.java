package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category, Long> {
}
