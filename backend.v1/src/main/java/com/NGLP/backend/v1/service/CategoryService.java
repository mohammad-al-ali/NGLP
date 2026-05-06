package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Category;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.CategoryRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepo categoryRepo;

    public CategoryService(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    public List<Category> findAll() { return categoryRepo.findAll(); }

    public Category findById(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    public Category create(Category category) { return categoryRepo.save(category); }

    public Category update(Long id, Category category) {
        return categoryRepo.findById(id).map(existing -> {
            existing.setName(category.getName());
            existing.setParent(category.getParent());
            return categoryRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    public void delete(Long id) { categoryRepo.deleteById(id); }
}
