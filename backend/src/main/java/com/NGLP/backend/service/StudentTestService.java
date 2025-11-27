package com.NGLP.backend.service;

import com.NGLP.backend.model.StudentTest;
import com.NGLP.backend.repository.StudentTestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentTestService {

    private final StudentTestRepository repository;

    public StudentTestService(StudentTestRepository repository) {
        this.repository = repository;
    }

    public StudentTest save(StudentTest s) {
        return repository.save(s);
    }

    public List<StudentTest> findAll() {
        return repository.findAll();
    }
}