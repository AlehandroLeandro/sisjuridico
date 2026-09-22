package sisjuridico.carbocat.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import sisjuridico.carbocat.entities.Evento;

import java.time.LocalDate;

public interface EventoRepository extends JpaRepository<Evento, Long>, JpaSpecificationExecutor<Evento> {
    Slice<Evento> findByDataGreaterThanEqual(LocalDate data, Pageable pageable);
}
