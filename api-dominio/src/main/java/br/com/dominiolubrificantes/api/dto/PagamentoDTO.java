package br.com.dominiolubrificantes.api.dto;

public record PagamentoDTO(
    String formaPagamento, // Ex: "CARTAO", "DINHEIRO", "PIX"
    double valor
) {}