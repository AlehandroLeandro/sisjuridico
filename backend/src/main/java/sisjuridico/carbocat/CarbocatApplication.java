package sisjuridico.carbocat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CarbocatApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarbocatApplication.class, args);
	}

}
