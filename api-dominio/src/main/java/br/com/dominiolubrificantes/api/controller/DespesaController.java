package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.entity.Despesa;
import br.com.dominiolubrificantes.api.repository.DespesaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/despesas")
@CrossOrigin(origins = "*") // Lembre-se de ajustar o CORS se necessário
public class DespesaController {

    private final DespesaRepository repository;

    DespesaController(DespesaRepository repository) {
        this.repository = repository;
    }

    // 1. Cadastrar nova conta a pagar
    @PostMapping
    public ResponseEntity<Despesa> criar(@RequestBody Despesa despesa) {
        if (despesa.getStatus() == null) {
            despesa.setStatus("PENDENTE"); // Define como padrão
        }
        Despesa salva = repository.save(despesa);
        return ResponseEntity.ok(salva);
    }

    // 2. Listar contas pendentes de HOJE
    @GetMapping("/hoje")
    public ResponseEntity<List<Despesa>> listarPendentesDeHoje() {
        LocalDate hoje = LocalDate.now();
        List<Despesa> pendentesHoje = repository.findByDataVencimentoAndStatus(hoje, "PENDENTE");
        return ResponseEntity.ok(pendentesHoje);
    }
    
    // 3. Listar TODAS as despesas (para histórico geral)
    @GetMapping
    public ResponseEntity<List<Despesa>> listarTodas() {
        return ResponseEntity.ok(repository.findAll());
    }

    // 4. Marcar uma conta como PAGA
    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Despesa> marcarComoPaga(@PathVariable Long id) {
        return repository.findById(id).map(despesa -> {
            despesa.setStatus("PAGO");
            repository.save(despesa);
            return ResponseEntity.ok(despesa);
        }).orElse(ResponseEntity.notFound().build());
    }
}