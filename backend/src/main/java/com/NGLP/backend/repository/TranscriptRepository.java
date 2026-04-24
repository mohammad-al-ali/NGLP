package com.NGLP.backend.repository;

import com.NGLP.backend.entity.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {

    Optional<Transcript> findByLessonId(Long lessonId);

    List<Transcript> findByStatus(Transcript.Status status);
}