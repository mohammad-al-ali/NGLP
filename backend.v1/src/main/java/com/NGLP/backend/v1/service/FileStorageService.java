package com.NGLP.backend.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadRoot = Path.of("uploads", "videos");

    public String saveVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Video file is required.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "lesson.mp4" : file.getOriginalFilename());
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".mp4";
        String storedFilename = UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadRoot);
            Path destination = uploadRoot.resolve(storedFilename).normalize();
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/videos/" + storedFilename;
        } catch (IOException e) {
            throw new IllegalStateException("Could not store video file.", e);
        }
    }
}
