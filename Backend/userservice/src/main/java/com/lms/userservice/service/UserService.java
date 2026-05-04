package com.lms.userservice.service;

import com.lms.userservice.model.User;

import java.util.List;

public interface UserService {

    public User createUser(User user);

    public List<User> getAllUsers();

    public User getUserById(Long id);

    public void deleteUser(Long id);
}