package br.com.dominiolubrificantes.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class NovaTrocaRequest {

    @NotBlank(message = "A placa é obrigatória")
    private String placa;

    @NotBlank(message = "O nome do cliente é obrigatório")
    private String nomeCliente;

    @NotBlank(message = "O WhatsApp é obrigatório")
    private String whatsapp;

    private String modelo;
    private String marca;
    private String ano;

    @NotNull(message = "A quilometragem atual é obrigatória")
    private Integer kmAtual;

    @NotBlank(message = "A descrição do serviço/óleo é obrigatória")
    private String descricaoServico;

    // 📦 Integração com Estoque
    private Long produtoOleoId;
    private BigDecimal quantidadeLitros;

    private Long produtoFiltroOleoId;
    private Long produtoFiltroArId;
}