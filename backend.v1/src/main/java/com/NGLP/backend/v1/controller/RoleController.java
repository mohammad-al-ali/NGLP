package com.NGLP.backend.v1.controller;

import com.NGLP.backend.v1.entity.Role;
import com.NGLP.backend.v1.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) { this.roleService = roleService; }

    @GetMapping
    public List<Role> getAll() { return roleService.findAll(); }

    @GetMapping("/{id}")
    public Role getById(@PathVariable Long id) { return roleService.findById(id); }

    @PostMapping
    public Role create(@RequestBody Role role) { return roleService.create(role); }

    @PutMapping("/{id}")
    public Role update(@PathVariable Long id, @RequestBody Role role) { return roleService.update(id, role); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
