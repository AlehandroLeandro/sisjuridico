package sisjuridico.carbocat;

import org.springframework.boot.SpringApplication;

public class TestCarbocatApplication {

	public static void main(String[] args) {
		SpringApplication.from(CarbocatApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
