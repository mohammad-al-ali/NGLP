package com.NGLP.backend.v1.entity;


import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String email;
    private String password; //TODO ENCRYPTION
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
}
