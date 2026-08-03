package br.com.dominiolubrificantes.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MovimentacaoEstoqueDTO {

    @NotNull(message = "O ID do produto é obrigatório")
    private Long produtoId;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    private BigDecimal quantidade;

    // Campo de valor unitário pago na compra
    private BigDecimal precoCustoUnitario;

    // Observação ou Nota Fiscal
    private String observacao;
}