package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.dto.request.MensagemManualRequest;
import br.com.dominiolubrificantes.api.service.WhatsappService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite chamadas do React
public class WhatsappController {

    private final WhatsappService whatsappService;

    /**
     * POST /api/whatsapp/enviar-texto
     * Permite ao balcão enviar uma mensagem personalizada ou avisos ao cliente
     */
    @PostMapping("/enviar-texto")
    public ResponseEntity<Void> enviarMensagemManual(@RequestBody MensagemManualRequest request) {
        if (request.getWhatsapp() == null || request.getMensagem() == null) {
            return ResponseEntity.badRequest().build();
        }

        whatsappService.enviarMensagemTexto(request.getWhatsapp(), request.getMensagem());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/whatsapp/teste
     * Endpoint rápido para testar se a API do WhatsApp (porta 8085) está respondendo
     */
    @PostMapping("/teste")
    public ResponseEntity<String> testarConexao(@RequestParam String whatsapp) {
        String mensagemTeste = "🟢 *Domínio Lubrificantes*: Teste de conexão do sistema Java com o WhatsApp realizado com sucesso!";
        whatsappService.enviarMensagemTexto(whatsapp, mensagemTeste);
        return ResponseEntity.ok("Mensagem de teste enviada para " + whatsapp);
    }
}