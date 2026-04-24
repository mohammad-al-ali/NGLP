package com.NGLP.backend.repository;

import com.NGLP.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByUserId(Long userId);

    List<Lesson> findByTitleContainingIgnoreCase(String title);
}