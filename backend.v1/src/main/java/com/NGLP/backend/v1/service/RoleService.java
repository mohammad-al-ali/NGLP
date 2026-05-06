package com.NGLP.backend.v1.service;

import com.NGLP.backend.v1.entity.Role;
import com.NGLP.backend.v1.exception.ResourceNotFoundException;
import com.NGLP.backend.v1.repo.RoleRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {
    private final RoleRepo roleRepo;

    public RoleService(RoleRepo roleRepo) { this.roleRepo = roleRepo; }

    public List<Role> findAll() { return roleRepo.findAll(); }

    public Role findById(Long id) {
        return roleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
    }

    public Role create(Role role) { return roleRepo.save(role); }

    public Role update(Long id, Role role) {
        return roleRepo.findById(id).map(existing -> {
            existing.setName(role.getName());
            existing.setDescription(role.getDescription());
            return roleRepo.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
    }

    public void delete(Long id) { roleRepo.deleteById(id); }
}
