package br.com.dominiolubrificantes.api.dto;


public record DestinatarioDTO(
        String nome,
        String documento, // CPF ou CNPJ
        String inscricaoEstadual, // Opcional para isentos ou PJ
        String logradouro,
        String numero,
        String bairro,
        String cidade,
        String uf,
        String cep
    ) {}