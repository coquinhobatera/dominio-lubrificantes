package br.com.dominiolubrificantes.api.dto;

public record ItemVendaDTO(
    String codigoProduto,
    String descricao,
    String ncm,
    int quantidade,
    double valorUnitario,
    double valorTotal
) {}