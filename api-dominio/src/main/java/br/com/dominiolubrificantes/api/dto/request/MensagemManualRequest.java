package br.com.dominiolubrificantes.api.dto.request;

import lombok.Data;

@Data
public class MensagemManualRequest {
    private String whatsapp;
    private String mensagem;
}