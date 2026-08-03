package br.com.dominiolubrificantes.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tb_trocas_oleo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrocaOleo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "veiculo_placa", nullable = false)
    private Veiculo veiculo;

    @Column(nullable = false)
    private LocalDate dataTroca;

    @Column(nullable = false)
    private Integer kmAtual;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descricaoServico;

    @Column(nullable = false)
    private LocalDate dataLembrete; // dataTroca + 6 meses

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusLembrete statusLembrete = StatusLembrete.PENDENTE;
}