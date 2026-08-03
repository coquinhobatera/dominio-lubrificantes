package br.com.dominiolubrificantes.api.repository;

import br.com.dominiolubrificantes.api.entity.StatusLembrete;
import br.com.dominiolubrificantes.api.entity.TrocaOleo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrocaOleoRepository extends JpaRepository<TrocaOleo, Long> {

    @Query("SELECT t FROM TrocaOleo t " +
           "JOIN FETCH t.veiculo v " +
           "JOIN FETCH v.cliente c " +
           "WHERE t.dataLembrete <= :data " +
           "AND t.statusLembrete = :status")
    List<TrocaOleo> findByDataLembreteAndStatusLembrete(
        @Param("data") LocalDate data, 
        @Param("status") StatusLembrete status
    );

    List<TrocaOleo> findByVeiculoPlacaIgnoreCaseOrderByDataTrocaDesc(String placa);
}