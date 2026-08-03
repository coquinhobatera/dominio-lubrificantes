package br.com.dominiolubrificantes.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioDiarioDTO {

    private LocalDate data;
    private BigDecimal faturamentoTotal;
    private Integer quantidadeOsConcluidas;
    private List<ItemVendidoResumoDTO> itensVendidos;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemVendidoResumoDTO {
        private String descricao;       // Nome do produto ou descrição do serviço
        private BigDecimal quantidade;   // Quantidade total vendida no dia
        private BigDecimal totalVendido; // Total faturado com este item no dia
    }
}