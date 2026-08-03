package br.com.dominiolubrificantes.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrdemServicoDTO {

    @NotBlank(message = "Nome do cliente é obrigatório")
    private String clienteNome;

    private String clienteWhatsapp;

    @NotBlank(message = "Placa do veículo é obrigatória")
    private String veiculoPlaca;

    private String veiculoModelo;
    private Integer veiculoKm;
    private String formaPagamento;
    private String observacoes;

    private List<ItemOSRequest> itens;

    @Getter
    @Setter
    public static class ItemOSRequest {
        private Long produtoId;            // Preenchido se for produto do estoque
        private String descricaoServico;   // Preenchido se for mão de obra
        private BigDecimal quantidade;
        private BigDecimal precoUnitario;
    }
}