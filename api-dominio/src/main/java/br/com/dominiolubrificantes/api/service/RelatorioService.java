package br.com.dominiolubrificantes.api.service;

import br.com.dominiolubrificantes.api.dto.RelatorioDiarioDTO;
import br.com.dominiolubrificantes.api.entity.ItemOrdemServico;
import br.com.dominiolubrificantes.api.entity.OrdemServico;
import br.com.dominiolubrificantes.api.entity.StatusOrdemServico;
import br.com.dominiolubrificantes.api.repository.OrdemServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final OrdemServicoRepository ordemServicoRepository;

    @Transactional(readOnly = true)
    public RelatorioDiarioDTO gerarRelatorioDiario(LocalDate data) {
        LocalDateTime inicioDia = data.atStartOfDay();
        LocalDateTime fimDia = data.atTime(LocalTime.MAX);

        // Busca todas as OS concluídas no dia
        List<OrdemServico> ordensConcluidas = ordemServicoRepository
                .findByStatusAndDataFinalizacaoBetween(StatusOrdemServico.CONCLUIDA, inicioDia, fimDia);

        // 1. Calcula Faturamento Total
        BigDecimal faturamentoTotal = ordensConcluidas.stream()
                .map(OrdemServico::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Agrupa os itens vendidos no dia
        Map<String, RelatorioDiarioDTO.ItemVendidoResumoDTO> mapaItens = new HashMap<>();

        for (OrdemServico os : ordensConcluidas) {
            for (ItemOrdemServico item : os.getItens()) {
                String chave = item.getProduto() != null 
                        ? item.getProduto().getNome() 
                        : item.getDescricaoServico();

                BigDecimal qtd = item.getQuantidade() != null ? item.getQuantidade() : BigDecimal.ZERO;
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;

                mapaItens.compute(chave, (k, existing) -> {
                    if (existing == null) {
                        return new RelatorioDiarioDTO.ItemVendidoResumoDTO(chave, qtd, subtotal);
                    } else {
                        existing.setQuantidade(existing.getQuantidade().add(qtd));
                        existing.setTotalVendido(existing.getTotalVendido().add(subtotal));
                        return existing;
                    }
                });
            }
        }

        return RelatorioDiarioDTO.builder()
                .data(data)
                .faturamentoTotal(faturamentoTotal)
                .quantidadeOsConcluidas(ordensConcluidas.size())
                .itensVendidos(new ArrayList<>(mapaItens.values()))
                .build();
    }
}