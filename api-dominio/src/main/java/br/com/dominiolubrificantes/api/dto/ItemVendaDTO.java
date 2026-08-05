package br.com.dominiolubrificantes.api.dto;
public record ItemVendaDTO(
        String codigoProduto,
        String descricao,
        String ncm,
        Integer quantidade,
        Double valorUnitario,
        Double valorTotal
    ) {}