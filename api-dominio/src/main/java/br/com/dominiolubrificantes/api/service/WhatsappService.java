package br.com.dominiolubrificantes.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WhatsappService {

    @Value("${whatsapp.api.url:http://localhost:8081}")
    private String apiUrl;

    @Value("${whatsapp.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envia uma mensagem de texto via WhatsApp.
     *
     * @param numero Telefone do cliente (ex: 5524999999999)
     * @param mensagem Texto com a mensagem/comprovante
     */
    public void enviarMensagemTexto(String numero, String mensagem) {
        if (numero == null || numero.isBlank()) {
            log.warn("Número de WhatsApp não informado. Envio de mensagem cancelado.");
            return;
        }

        // Formata o número garantindo apenas dígitos
        String numeroSanitizado = sanitizarNumero(numero);

        try {
            // Ajustado para bater exatamente na rota 'app.post('/send-message')' do seu index.js
            String url = apiUrl + "/send-message";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.set("apikey", apiKey);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("phone", numeroSanitizado);
            body.put("message", mensagem); // Se o seu index.js usa req.body.text, mude para "text"

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(url, requestEntity, String.class);
            log.info("Mensagem enviada com sucesso no WhatsApp para o número {}", numeroSanitizado);

        } catch (Exception e) {
            log.error("Erro ao enviar mensagem via WhatsApp para {}: {}", numeroSanitizado, e.getMessage());
            // Lança a exceção para que o Scheduler saiba que falhou e NÃO marque como ENVIADO no banco
            throw new RuntimeException("Falha no envio da mensagem via WhatsApp: " + e.getMessage(), e);
        }
    }

    /**
     * Sanitiza o número de telefone, mantendo apenas os números e adicionando o DDI 55 se necessário.
     */
    private String sanitizarNumero(String numero) {
        String apenasNumeros = numero.replaceAll("[^0-9]", "");
        
        // Se o número tiver 10 ou 11 dígitos (padrão Brasil sem DDI 55), adiciona o 55
        if (apenasNumeros.length() == 10 || apenasNumeros.length() == 11) {
            return "55" + apenasNumeros;
        }

        return apenasNumeros;
    }
}