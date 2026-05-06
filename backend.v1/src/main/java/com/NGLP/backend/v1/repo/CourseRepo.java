package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepo extends JpaRepository<Course, Long> {
}
