package br.com.dominiolubrificantes.api.scheduler;

import br.com.dominiolubrificantes.api.entity.StatusLembrete;
import br.com.dominiolubrificantes.api.entity.TrocaOleo;
import br.com.dominiolubrificantes.api.repository.TrocaOleoRepository;
import br.com.dominiolubrificantes.api.service.WhatsappService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class LembreteScheduler {

    private final TrocaOleoRepository trocaOleoRepository;
    private final WhatsappService whatsappService; // 🟢 Injeção do serviço de WhatsApp via Lombok

    // Roda todos os dias às 09:00 da manhã
  @Scheduled(cron = "0 0 9 * * *", zone = "America/Sao_Paulo")
public void verificarLembretesDeSeisMeses() {
    LocalDate hoje = LocalDate.now();
        List<TrocaOleo> pendentes = trocaOleoRepository.findByDataLembreteAndStatusLembrete(hoje, StatusLembrete.PENDENTE);

        log.info("Verificando lembretes de 6 meses para hoje ({}). Encontrados: {}", hoje, pendentes.size());

        for (TrocaOleo troca : pendentes) {
            String nome = troca.getVeiculo().getCliente().getNome();
            String modelo = troca.getVeiculo().getModelo();
            String placa = troca.getVeiculo().getPlaca();
            Integer km = troca.getKmAtual();
            String whatsapp = troca.getVeiculo().getCliente().getWhatsapp();

            if (whatsapp == null || whatsapp.isBlank()) {
                log.warn("Cliente {} (Troca ID {}) não possui WhatsApp cadastrado. Ignorando disparo.", nome, troca.getId());
                continue;
            }

            String mensagem = String.format(
                "Olá, %s! 👋 Faz 6 meses que você realizou a troca de óleo do seu *%s* (Placa *%s*) na *Domínio Lubrificantes*! 🛢️🚗\n\n" +
                "Na época, seu veículo estava com *%d KM*.\n\n" +
                "Recomendamos dar uma passada aqui no balcão para checar o nível do óleo, filtros e garantir que a manutenção continue em dia. Te esperamos!",
                nome, modelo, placa, km
            );

            try {
                // 🟢 Disparo real para o provedor de WhatsApp (Evolution API / Z-API)
                whatsappService.enviarMensagemTexto(whatsapp, mensagem);

                log.info("Lembrete enviado com sucesso para {} ({})", nome, whatsapp);

                // Atualiza o status no banco
                troca.setStatusLembrete(StatusLembrete.ENVIADO);
                trocaOleoRepository.save(troca);

            } catch (Exception e) {
                log.error("Falha ao enviar lembrete para {} ({}): {}", nome, whatsapp, e.getMessage());
                // Não altera o status para ENVIADO caso ocorra erro na rede/API,
                // assim o sistema pode tentar novamente na próxima execução.
            }
        }
    }
}