package sisjuridico.carbocat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.enums.Role;
import sisjuridico.carbocat.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        boolean adminAlreadyExists = userRepository.findByUserName(adminUsername).isPresent();

        if (adminAlreadyExists) {
            return;
        }

        User admin = new User();
        admin.setName(adminName);
        admin.setUserName(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);
    }
}
