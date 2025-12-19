package com.NGLP.backend.controller;

import com.NGLP.backend.entity.Course;
import com.NGLP.backend.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // جلب جميع الكورسات
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // جلب كورس واحد حسب id
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    // إضافة كورس جديد
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    // تعديل كورس
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course != null) {
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            course.setPrice(courseDetails.getPrice());
            course.setDiscount(courseDetails.getDiscount());
            course.setRating(courseDetails.getRating());
            course.setCategory(courseDetails.getCategory());
            return courseRepository.save(course);
        }
        return null;
    }

    // حذف كورس
    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
    }
}
