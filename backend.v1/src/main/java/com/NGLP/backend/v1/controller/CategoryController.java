package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.Category;
import com.NGLP.backend.v1.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) { this.categoryService = categoryService; }

    @GetMapping
    public List<Category> getAll() { return categoryService.findAll(); }

    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) { return categoryService.findById(id); }

    @PostMapping
    public Category create(@RequestBody Category category) { return categoryService.create(category); }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) { return categoryService.update(id, category); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
