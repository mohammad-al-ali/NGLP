package com.NGLP.backend.repository;


import com.NGLP.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find all categories that have no parent (root categories)
    List<Category> findByParentCategoryIsNull();

    // Find all subcategories of a given parent
    List<Category> findByParentCategory(Category parentCategory);

    // Find category by name
    Category findByName(String name);

    // Optional: find all categories by parent id
    List<Category> findByParentCategory_Id(Long parentId);

    
}
