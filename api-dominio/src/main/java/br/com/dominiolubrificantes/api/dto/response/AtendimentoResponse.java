package br.com.dominiolubrificantes.api.dto.response;

import br.com.dominiolubrificantes.api.entity.StatusLembrete;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AtendimentoResponse {
    private String placa;
    private String modelo;
    private String marca;
    private String ano;             // 👈 Se no Veiculo for Integer, aqui DEVE ser Integer
    private String nomeCliente;
    private String whatsapp;

    // Dados da última troca
    private Integer kmAtual;
    private String descricaoServico;
    private LocalDate dataLembrete;
    private StatusLembrete statusLembrete; // 👈 Usando o Enum diretamente

    private List<TrocaHistoricoDto> historicoTrocas;

    @Data
    public static class TrocaHistoricoDto {
        private Long id;
        private LocalDate dataTroca;
        private Integer kmAtual;
        private String descricaoServico;
        private LocalDate dataLembrete;
        private StatusLembrete statusLembrete; // 👈 Usando o Enum diretamente
    }
}