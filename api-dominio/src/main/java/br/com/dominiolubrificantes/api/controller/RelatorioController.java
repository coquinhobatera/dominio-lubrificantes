package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.dto.RelatorioDiarioDTO;
import br.com.dominiolubrificantes.api.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final RelatorioService relatorioService;

    // GET /api/relatorios/diario (retorna o relatório de hoje por padrão, ou de uma data específica via ?data=YYYY-MM-DD)
    @GetMapping("/diario")
    public ResponseEntity<RelatorioDiarioDTO> obterRelatorioDiario(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        
        LocalDate dataConsulta = (data != null) ? data : LocalDate.now();
        return ResponseEntity.ok(relatorioService.gerarRelatorioDiario(dataConsulta));
    }
}