package br.com.dominiolubrificantes.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EntradaEstoqueRequest {

    @NotNull(message = "O ID do produto é obrigatório")
    private Long produtoId;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    private BigDecimal quantidade;

    // Preço de custo unitário pago nesta compra (opcional, atualiza o custo do produto se informado)
    private BigDecimal precoCustoUnitario;

    // Número da Nota Fiscal, Fornecedor ou Observação
    private String observacao;
}