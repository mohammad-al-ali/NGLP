 package com.NGLP.backend.controller;

import com.NGLP.backend.model.StudentTest;
import com.NGLP.backend.service.StudentTestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class StudentTestController {

    private final StudentTestService service;

    public StudentTestController(StudentTestService service) {
        this.service = service;
    }

    @PostMapping
    public StudentTest create(@RequestBody StudentTest student) {
        return service.save(student);
    }

    @GetMapping
    public List<StudentTest> getAll() {
        return service.findAll();
    }
}