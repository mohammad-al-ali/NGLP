package com.NGLP.backend.v1.repo;

import com.NGLP.backend.v1.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepo extends JpaRepository<Lesson, Long> {
}
