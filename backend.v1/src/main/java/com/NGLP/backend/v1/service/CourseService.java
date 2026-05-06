package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Course;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.CourseRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
    private final CourseRepo courseRepo;

    public CourseService(CourseRepo courseRepo) { this.courseRepo = courseRepo; }

    public List<Course> findAll() { return courseRepo.findAll(); }

    public Course findById(Long id) {
        return courseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }

    public Course create(Course course) { return courseRepo.save(course); }

    public Course update(Long id, Course course) {
        return courseRepo.findById(id).map(existing -> {
            existing.setTitle(course.getTitle());
            existing.setDescription(course.getDescription());
            existing.setCategory(course.getCategory());
            return courseRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }

    public void delete(Long id) { courseRepo.deleteById(id); }
}
