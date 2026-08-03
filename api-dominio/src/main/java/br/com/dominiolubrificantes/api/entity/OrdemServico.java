package br.com.dominiolubrificantes.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_ordem_servico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dados do Cliente
    @NotBlank(message = "O nome do cliente é obrigatório")
    @Column(name = "cliente_nome", nullable = false, length = 100)
    private String clienteNome;

    @Column(name = "cliente_whatsapp", length = 20)
    private String clienteWhatsapp;

    // Dados do Veículo
    @NotBlank(message = "A placa do veículo é obrigatória")
    @Column(name = "veiculo_placa", nullable = false, length = 10)
    private String veiculoPlaca;

    @Column(name = "veiculo_modelo", length = 50)
    private String veiculoModelo; // Ex: "Honda Civic 2.0"

    @Column(name = "veiculo_km")
    private Integer veiculoKm; // Ex: 85400

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOrdemServico status;

    // Itens da Ordem de Serviço (Produtos + Mão de obra)
    @Builder.Default
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemOrdemServico> itens = new ArrayList<>();

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "forma_pagamento", length = 30)
    private String formaPagamento; // Ex: "PIX", "CARTAO_CREDITO", "DINHEIRO"

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_finalizacao")
    private LocalDateTime dataFinalizacao;

    @Column(length = 500)
    private String observacoes;

    @PrePersist
    public void prePersist() {
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusOrdemServico.ABERTA;
        }
        calcularValorTotal();
    }

    public void adicionarItem(ItemOrdemServico item) {
        itens.add(item);
        item.setOrdemServico(this);
        calcularValorTotal();
    }

    public void calcularValorTotal() {
        this.valorTotal = itens.stream()
                .map(item -> {
                    if (item.getSubtotal() == null && item.getPrecoUnitario() != null && item.getQuantidade() != null) {
                        return item.getPrecoUnitario().multiply(item.getQuantidade());
                    }
                    return item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}