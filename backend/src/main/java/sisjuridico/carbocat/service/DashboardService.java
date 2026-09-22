package sisjuridico.carbocat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.response.DashboardExpiringContractDTO;
import sisjuridico.carbocat.dto.response.DashboardKpiDTO;
import sisjuridico.carbocat.dto.response.DashboardNatureDistributionDTO;
import sisjuridico.carbocat.dto.response.DashboardRecentDocumentDTO;
import sisjuridico.carbocat.dto.response.DashboardResponseDTO;
import sisjuridico.carbocat.dto.response.EventoResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.Document;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.mapper.EventoMapper;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.DocumentsRepository;
import sisjuridico.carbocat.repository.EventoRepository;
import sisjuridico.carbocat.repository.LawsuitRepository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {
    private final LawsuitRepository lawsuitRepository;
    private final ContractRepository contractRepository;
    private final DocumentsRepository documentsRepository;
    private final EventoRepository eventoRepository;
    private final EventoMapper eventoMapper;

    public DashboardResponseDTO getDashboard() {
        LocalDate today = LocalDate.now();
        List<Lawsuit> lawsuits = lawsuitRepository.findAll();
        List<Contract> contracts = contractRepository.findAll();
        return new DashboardResponseDTO(
                kpis(lawsuits, contracts, today),
                expiringContracts(today),
                recentDocuments(),
                natureDistribution(lawsuits),
                upcomingEvents(today)
        );
    }

    private List<DashboardKpiDTO> kpis(List<Lawsuit> lawsuits, List<Contract> contracts, LocalDate today) {
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        long activeContracts = contracts.stream().filter(Contract::isActive).count();
        return List.of(
                new DashboardKpiDTO("activeLawsuits", lawsuits.size(), monthDelta(lawsuits, Lawsuit::getDataInicio, currentMonth, previousMonth)),
                new DashboardKpiDTO("activeContracts", activeContracts, monthDelta(contracts, Contract::getStartDate, currentMonth, previousMonth)),
                new DashboardKpiDTO("contractsExpiringIn30Days", expiringContracts(today).size(), 0)
        );
    }

    private <T> long monthDelta(List<T> values, Function<T, LocalDate> date, YearMonth current, YearMonth previous) {
        long currentCount = values.stream().map(date).filter(current::equals).count();
        long previousCount = values.stream().map(date).filter(previous::equals).count();
        return currentCount - previousCount;
    }

    private List<DashboardExpiringContractDTO> expiringContracts(LocalDate today) {
        return contractRepository.findTop4ByActiveTrueAndEndDateBetweenOrderByEndDateAsc(today, today.plusDays(30)).stream()
                .map(contract -> new DashboardExpiringContractDTO(contract.getId(), contract.getContractor().getName(),
                        contract.getTypeContract(), contract.getValue(), ChronoUnit.DAYS.between(today, contract.getEndDate()), contract.getEndDate()))
                .toList();
    }

    private List<DashboardRecentDocumentDTO> recentDocuments() {
        return documentsRepository.findTop4ByOrderByCreatedAtDesc().stream()
                .map(document -> new DashboardRecentDocumentDTO(document.getId(), document.getFileName(), ownerLabel(document), document.getCreatedAt()))
                .toList();
    }

    private String ownerLabel(Document document) {
        if (document.getContract() != null) return "Contrato " + document.getContract().getFile();
        return "Processo " + document.getLawsuit().getNumProcesso();
    }

    private List<DashboardNatureDistributionDTO> natureDistribution(List<Lawsuit> lawsuits) {
        Map<Nature, Long> counts = lawsuits.stream().collect(Collectors.groupingBy(Lawsuit::getNature, Collectors.counting()));
        return Arrays.stream(Nature.values()).map(nature -> new DashboardNatureDistributionDTO(nature, counts.getOrDefault(nature, 0L))).toList();
    }

    private List<EventoResponseDTO> upcomingEvents(LocalDate today) {
        Sort sort = Sort.by(Sort.Order.asc("data"), Sort.Order.asc("hora").nullsLast());
        return eventoRepository.findByDataGreaterThanEqual(today, PageRequest.of(0, 5, sort)).getContent().stream()
                .map(eventoMapper::toResponse)
                .toList();
    }
}
