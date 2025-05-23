package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="worker")
@Getter
@Setter
public class Worker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worker_id")
    private Integer id;

    @Column(name = "surname", nullable = false, length = 50)
    private String lastName;

    @Column(name = "name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "second_name", nullable = false, length = 50)
    private String middleName;

    @Column(name = "password", nullable = false, length = 64)
    private String password;

    @Column(name = "email", nullable = false, length = 50, unique = true)
    private String email;

//    @OneToMany(mappedBy = "worker")
//    private Set<Request> requests = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private WorkerRole role;
}

//    public UserDetails toUserDetails() {
//        return new org.springframework.security.core.userdetails.User(
//                this.email,
//                this.password,
//                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
//        );
//    }
