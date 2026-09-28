package com.example.stockalert.service;

import com.example.stockalert.entity.Product;
import com.example.stockalert.entity.ReorderAlert;
import com.example.stockalert.entity.StockMovement;
import com.example.stockalert.repository.ProductRepository;
import com.example.stockalert.repository.ReorderAlertRepository;
import com.example.stockalert.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReorderAlertService {

    private final ReorderAlertRepository reorderAlertRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public ReorderAlertService(
            ReorderAlertRepository reorderAlertRepository,
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository) {

        this.reorderAlertRepository = reorderAlertRepository;
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    public void checkAndCreateAlert(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        List<StockMovement> movements =
                stockMovementRepository.findByProductId(productId);

        int currentStock = 0;

        for (StockMovement movement : movements) {

            if (movement.getMovementType()
                    .equalsIgnoreCase("IN")) {

                currentStock += movement.getQuantity();

            } else if (movement.getMovementType()
                    .equalsIgnoreCase("OUT")) {

                currentStock -= movement.getQuantity();
            }
        }

        if (currentStock <= product.getReorderThreshold()) {

            boolean openAlertExists =
                    reorderAlertRepository
                            .findByProductIdAndStatus(
                                    productId,
                                    "OPEN")
                            .isPresent();

            if (!openAlertExists) {

                ReorderAlert alert = new ReorderAlert();

                alert.setProduct(product);
                alert.setCurrentStock(currentStock);
                alert.setReorderQuantity(
                        product.getReorderQuantity());
                alert.setStatus("OPEN");
                alert.setCreatedAt(LocalDateTime.now());

                reorderAlertRepository.save(alert);
            }
        }
    }

    public List<ReorderAlert> getAllAlerts() {
        return reorderAlertRepository.findAll();
    }

    public List<ReorderAlert> getOpenAlerts() {
        return reorderAlertRepository.findByStatus("OPEN");
    }

    public ReorderAlert markFulfilled(Long id) {

        ReorderAlert alert =
                reorderAlertRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Reorder alert not found"));

        alert.setStatus("FULFILLED");

        return reorderAlertRepository.save(alert);
    }
}
