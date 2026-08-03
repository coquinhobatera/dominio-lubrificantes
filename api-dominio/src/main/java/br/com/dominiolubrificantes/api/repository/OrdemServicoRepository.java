package br.com.dominiolubrificantes.api.repository;

import br.com.dominiolubrificantes.api.entity.OrdemServico;
import br.com.dominiolubrificantes.api.entity.StatusOrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    // Buscar histórico de OS por placa de veículo
    List<OrdemServico> findByVeiculoPlacaIgnoreCaseOrderByDataCriacaoDesc(String veiculoPlaca);

    // Listar por status (ex: ABERTA, CONCLUIDA)
    List<OrdemServico> findByStatusOrderByDataCriacaoDesc(StatusOrdemServico status);
}