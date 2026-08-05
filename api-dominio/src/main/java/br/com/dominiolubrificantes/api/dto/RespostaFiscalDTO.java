package br.com.dominiolubrificantes.api.dto;


// Resposta padrão unificada para as duas notas
    public record RespostaFiscalDTO(
        String status, 
        String chaveAcesso, 
        String urlPdf
    ) {}
